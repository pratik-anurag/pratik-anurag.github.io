import test from 'node:test';
import assert from 'node:assert/strict';
import { corpus } from '../ephor/rules.js';
import { scan, MAX_BYTES } from '../ephor/scan.js';
import { samples } from '../ephor/samples.js';
import { readFile } from 'node:fs/promises';
import { initScanner } from '../ephor/scan.js';
assert.equal(await initScanner(await readFile(new URL('../ephor/engine.wasm',import.meta.url))),corpus.rules.length);
for (const rule of corpus.rules) test(`Bundled Nosey Parker rule: ${rule.id} ${rule.name}`,()=>{
  assert.ok(rule.pattern, 'original upstream regex retained');
  assert.equal(rule.fixtureCheck.passed,true,'importer checked upstream fixtures');
  assert.ok(Number.isInteger(rule.fixtureCheck.positive));
  assert.ok(Number.isInteger(rule.fixtureCheck.negative));
  assert.equal(rule.examples,undefined,'upstream credential fixtures are not distributed');
  assert.equal(rule.negativeExamples,undefined);
});
test('complete corpus has every pinned rule file, no skipped rules, and matching Wasm input',async()=>{
  const embedded=JSON.parse(await readFile(new URL('../ephor/engine/corpus.json',import.meta.url),'utf8'));
  assert.deepEqual(embedded,corpus);
  assert.equal(corpus.coverage.upstreamFiles,87);
  assert.equal(corpus.coverage.upstreamRules,189);
  assert.equal(corpus.rules.length,corpus.coverage.upstreamRules);
  assert.equal(corpus.files.length,corpus.coverage.upstreamFiles);
  assert.deepEqual(corpus.skipped,[]);
  assert.equal(new Set(corpus.rules.map(r=>r.id)).size,corpus.rules.length);
  assert.deepEqual([...new Set(corpus.rules.map(r=>r.file))].sort(),[...corpus.files].sort());
});
test('JWTs and both JWT signing-secret syntaxes are covered and redacted',()=>{
  const result=scan(samples.jwt.text);
  assert.ok(result.findings.some(f=>f.id==='np.jwt.1' && f.kind==='sensitive'));
  assert.ok(result.findings.some(f=>f.id==='np.jwt.2'));
  assert.ok(scan("jwtsecret: 'synthetic-demo-signing-secret'").findings.some(f=>f.id==='np.jwt.3'));
  assert.ok(!result.redacted.includes('synthetic-demo-signing-secret'));
  assert.ok(!result.redacted.includes('A'.repeat(43)));
});
test('formerly excluded scoped-flag rules now run, with byte-mode Unicode positions',()=>{
  const aws='AKIA'+'DEADBEEFDEADBEEF';
  assert.ok(scan(aws+'\n'+'a'.repeat(40)+'\n').findings.some(f=>f.id==='np.aws.6'));
  const token='ghp_'+'a'.repeat(36);
  const found=scan('星'+token+'星').findings.find(f=>f.id==='np.github.1');
  assert.equal(found.column,2);
  assert.equal(found.start,1);
});
test('first match follows bundled rule order and all synthetic credentials are found',()=>{
  const result=scan(samples.mixed.text);
  assert.equal(result.findings[0].id,'np.aws.1');
  assert.ok(result.findings.some(f=>f.name==='AWS Secret Access Key'));
  assert.ok(result.findings.some(f=>f.id.startsWith('np.github.')));
  assert.ok(!result.redacted.includes('DEMO'.repeat(9)));
  assert.ok(!result.redacted.includes('a'.repeat(40)));
  assert.ok(result.redacted.includes('PORT=3000'));
  assert.ok(!JSON.stringify(result.findings).includes('DEADBEEFDEADBEEF'));
});
test('clean and empty inputs do not assert safety or fabricate findings',()=>{
  assert.equal(scan(samples.clean.text).findings.length,0);
  assert.equal(scan('').findings.length,0);
});
test('line positions are one-based; repeated matches redact independently',()=>{
  const token='ghp_'+'a'.repeat(36);
  const result=scan(`\nTOKEN=${token}\nTOKEN=${token}`);
  const github=result.findings.filter(f=>f.id==='np.github.1');
  assert.equal(github.length,2); assert.equal(github[0].line,2); assert.equal(github[0].column,7);
  assert.ok(!result.redacted.includes(token));
});
test('input bytes, not characters, are bounded',()=>{
  assert.throws(()=>scan('a'.repeat(MAX_BYTES+1)),/256 KiB/);
  assert.throws(()=>scan('星'.repeat(MAX_BYTES/2)),/256 KiB/);
  assert.throws(()=>scan(null),/plain text/);
});
test('maximum-size nonmatching input scans with the full engine',()=>{
  const result=scan('#'.repeat(MAX_BYTES));
  assert.equal(result.rules,189);
  assert.equal(result.truncated,false);
  assert.equal(result.redacted.length,MAX_BYTES);
});
test('matching is repeatable and does not leak regex lastIndex',()=>{
  assert.deepEqual(scan(samples.slack.text),scan(samples.slack.text));
});
test('500-match cap disables potentially incomplete redaction',()=>{
  const result=scan(('ghp_'+'a'.repeat(36)+'\n').repeat(501));
  assert.equal(result.truncated,true); assert.equal(result.findings.length,500); assert.equal(result.redacted,null);
});
