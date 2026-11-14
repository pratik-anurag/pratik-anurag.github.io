//! Nosey Parker RuleSyntax-compatible byte regex compilation, without collectors
//! or credential validation. Original rules retain their Apache-2.0 notices.
use regex::bytes::{Regex, RegexBuilder};
use serde::{Deserialize, Serialize};
use std::sync::{Mutex, OnceLock};

pub const MAX_BYTES: usize = 256 * 1024;
#[derive(Deserialize)]
pub struct Rule {
    pub id: String,
    pub name: String,
    pub file: String,
    pub pattern: String,
    #[serde(default)]
    pub categories: Vec<String>,
}
#[derive(Deserialize)]
struct Corpus { rules: Vec<Rule> }

pub fn compile(pattern: &str) -> Result<Regex, regex::Error> {
    // Same comment removal, byte mode, Unicode setting, and size limit as
    // upstream noseyparker-rules/src/rule.rs at the pinned rule revision.
    static COMMENTS: OnceLock<regex::Regex> = OnceLock::new();
    let comments = COMMENTS.get_or_init(|| regex::Regex::new(r"\(\?#[^)]*\)").unwrap());
    RegexBuilder::new(&comments.replace_all(pattern, ""))
        .unicode(false).size_limit(16 * 1024 * 1024).build()
}
fn rules() -> &'static Vec<(Rule, Regex)> {
    static RULES: OnceLock<Vec<(Rule, Regex)>> = OnceLock::new();
    RULES.get_or_init(|| {
        let corpus: Corpus = serde_json::from_str(include_str!("../corpus.json")).expect("valid corpus");
        corpus.rules.into_iter().map(|rule| {
            let regex = compile(&rule.pattern).unwrap_or_else(|_| panic!("rule {} failed to compile", rule.id));
            (rule, regex)
        }).collect()
    })
}
#[derive(Serialize)]
struct Finding<'a> { id: &'a str, name: &'a str, file: &'a str, line: usize, column: usize, kind: &'a str, start: usize }

pub fn scan_text(text: &str) -> String {
    if text.len() > MAX_BYTES { return serde_json::json!({"error":"Input exceeds 256 KiB. Scan a smaller excerpt."}).to_string(); }
    let mut findings = Vec::new();
    let mut ranges: Vec<(usize, usize)> = Vec::new();
    let mut truncated = false;
    for (rule, regex) in rules() {
        for capture in regex.captures_iter(text.as_bytes()) {
            let mut spans: Vec<_> = capture.iter().skip(1).flatten().map(|m| (m.start(),m.end())).collect();
            if spans.is_empty() { let m=capture.get(0).unwrap(); spans.push((m.start(),m.end())); }
            let start = spans.iter().map(|s| s.0).min().unwrap();
            let prefix = &text.as_bytes()[..start];
            let line = prefix.iter().filter(|&&b| b == b'\n').count() + 1;
            let column_start = prefix.iter().rposition(|&b| b == b'\n').map_or(0,|p|p+1);
            let column = String::from_utf8_lossy(&prefix[column_start..]).encode_utf16().count() + 1;
            let utf16_start = String::from_utf8_lossy(prefix).encode_utf16().count();
            findings.push(Finding { id:&rule.id, name:&rule.name, file:&rule.file, line, column,
                kind:if rule.categories.iter().any(|c| c=="secret") {"secret"} else if rule.categories.iter().any(|c| c=="identifier") {"identifier"} else {"sensitive"}, start:utf16_start });
            ranges.extend(spans);
            if findings.len() >= 500 { truncated=true; break; }
        }
        if truncated { break; }
    }
    ranges.sort_unstable();
    let mut merged: Vec<(usize,usize)> = Vec::new();
    for (start,end) in ranges {
        if let Some(last) = merged.last_mut() {
            if start <= last.1 { last.1=last.1.max(end); continue; }
        }
        merged.push((start,end));
    }
    let redacted = if truncated { None } else {
        let mut out=Vec::new(); let mut offset=0;
        for (start,end) in merged { out.extend_from_slice(&text.as_bytes()[offset..start]); out.extend_from_slice(b"[REDACTED]"); offset=end; }
        out.extend_from_slice(&text.as_bytes()[offset..]); Some(String::from_utf8_lossy(&out).into_owned())
    };
    serde_json::json!({"findings":findings,"truncated":truncated,"redacted":redacted,"rules":rules().len()}).to_string()
}

// Small, trusted-host ABI. JS allocates the input, copies UTF-8, scans, reads the
// output before the next call, then frees the input. No wasm-bindgen/runtime glue.
#[no_mangle]
pub extern "C" fn alloc(len: usize) -> *mut u8 { Box::into_raw(vec![0u8;len].into_boxed_slice()) as *mut u8 }
#[no_mangle]
pub unsafe extern "C" fn dealloc(ptr: *mut u8, len: usize) { drop(Box::from_raw(std::ptr::slice_from_raw_parts_mut(ptr,len))); }
static OUTPUT: Mutex<Vec<u8>> = Mutex::new(Vec::new());
#[no_mangle]
pub unsafe extern "C" fn scan(ptr: *const u8, len: usize) -> *const u8 {
    let mut output=OUTPUT.lock().unwrap();
    *output=match std::str::from_utf8(std::slice::from_raw_parts(ptr,len)) {
        Ok(text)=>scan_text(text).into_bytes(),
        Err(_)=>br#"{"error":"Input must be valid UTF-8."}"#.to_vec(),
    };
    output.as_ptr()
}
#[no_mangle]
pub extern "C" fn result_len() -> usize { OUTPUT.lock().unwrap().len() }
#[no_mangle]
pub extern "C" fn rule_count() -> usize { rules().len() }

#[cfg(test)]
mod tests {
    use super::*;
    #[test] fn corpus_compiles_without_exclusions() { assert!(!rules().is_empty()); }
    #[test] fn supports_scoped_flags_and_absolute_anchors() { assert!(compile(r"\A(?i:jwt)(?-i:ABC)\z").unwrap().is_match(b"JWTABC")); }
    #[test] fn non_ascii_boundaries_use_upstream_byte_mode() { assert!(compile(r"\b(jwt)\b").unwrap().is_match("星jwt星".as_bytes())); }
}
