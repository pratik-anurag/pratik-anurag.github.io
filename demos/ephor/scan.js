import { corpus } from './rules.js';
export const MAX_BYTES = 256 * 1024;
export function scan(text) {
  if (typeof text !== 'string') throw Error('Paste plain text to scan.');
  if (new TextEncoder().encode(text).length > MAX_BYTES) throw Error('Input exceeds 256 KiB. Scan a smaller excerpt.');
  const findings = [], ranges = [];
  let truncated = false;
  for (const rule of corpus.rules) {
    const regex = new RegExp(rule.source, rule.flags);
    let match;
    while ((match = regex.exec(text))) {
      const captures = match.indices.slice(1).filter(Boolean);
      const spans = captures.length ? captures : [match.indices[0]];
      ranges.push(...spans);
      const start = Math.min(...spans.map(x => x[0]));
      const line = text.slice(0, start).split('\n').length;
      const column = start - text.lastIndexOf('\n', start - 1);
      findings.push({id: rule.id, name: rule.name, file: rule.file, line, column,
        kind: rule.categories.includes('secret') ? 'secret' : 'identifier', start});
      if (findings.length >= 500) { truncated = true; break; }
      if (!match[0].length) regex.lastIndex++;
    }
    if (truncated) break;
  }
  // Merge overlap (e.g. a key detected both on its own and in credentials).
  ranges.sort((a,b) => a[0]-b[0]);
  const merged = [];
  for (const span of ranges) {
    const last = merged.at(-1);
    if (last && span[0] <= last[1]) last[1] = Math.max(last[1], span[1]);
    else merged.push([...span]);
  }
  let redacted = text;
  for (const [start,end] of merged.reverse()) redacted = redacted.slice(0,start) + '[REDACTED]' + redacted.slice(end);
  return {findings, truncated, redacted: truncated ? null : redacted, rules: corpus.rules.length};
}
