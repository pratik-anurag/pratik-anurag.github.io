use ephor_browser_engine::{compile,Rule};
use serde::Deserialize;
use std::io::{self,Read};
#[derive(Deserialize)]
struct Fixture { #[serde(flatten)] rule:Rule, examples:Vec<String>, negative_examples:Vec<String> }
fn main() {
    let mut input=String::new(); io::stdin().read_to_string(&mut input).unwrap();
    let fixtures:Vec<Fixture>=serde_json::from_str(&input).expect("valid fixture input");
    let mut checked=0;
    for fixture in &fixtures {
        let regex=compile(&fixture.rule.pattern).unwrap_or_else(|_| panic!("rule {}: compilation failed",fixture.rule.id));
        for (examples,expected) in [(&fixture.examples,true),(&fixture.negative_examples,false)] {
            for example in examples { assert_eq!(regex.is_match(example.as_bytes()),expected,"rule {}: fixture mismatch (value withheld)",fixture.rule.id);checked+=1; }
        }
    }
    println!("Validated {} rules and {} upstream fixtures; no fixture values written.",fixtures.len(),checked);
}
