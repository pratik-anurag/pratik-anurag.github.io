const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const {execFileSync} = require("node:child_process");
const os = require("node:os");
const path = require("node:path");
globalThis.crypto ||= require("node:crypto").webcrypto;
require("../playground/wasm_exec.js");
(async () => {
 const go = new Go();
 const {instance} = await WebAssembly.instantiate(fs.readFileSync("playground/esplain.wasm"),go.importObject);
 go.run(instance);
 const result=JSON.parse(globalThis.explainQuery('{"size":10,"query":{"match":{"name":"running shoes"}}}'));
 if (result.error || !result.report.includes("Natural Language Breakdown") || result.tree.Name !== "root") throw new Error("Wasm bridge failed");
 const samples=vm.runInNewContext(fs.readFileSync("playground/samples.js","utf8")+"\nsamples");
 for(const sample of samples) {
  const result=JSON.parse(explainQuery(JSON.stringify(sample.query),sample.response?JSON.stringify(sample.response):""));
  assert.equal(result.error,undefined,sample.id);
  assert.ok(result.clauses.length);
  if(sample.id==="healthy")assert.equal(result.findings.length,0);
  if(sample.id==="slow")assert.ok(result.findings.some(f=>f.code==="script"));
  if(sample.id==="score")assert.equal(result.runtime.score.value,2.4);
  if(sample.id==="profile")assert.equal(result.runtime.totalNanos,20000000);
 }
 for(const query of ["", "{", "null", "[]", "x".repeat(1024*1024+1)]) assert.ok(JSON.parse(explainQuery(query)).error);
 const unknown=JSON.parse(explainQuery('{"future_clause":{"title":"<img src=x onerror=alert(1)>"}}'));
 assert.match(unknown.clauses[0].description,/Unrecognized/);
 assert.ok(JSON.parse(explainQuery('{"match_all":{}}','{"explanation":{"value":1}}')).error);
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),"esplain-parity-"));
 const sample=samples.find(s=>s.id==="profile");
 const q=JSON.stringify(sample.query),r=JSON.stringify(sample.response);
 fs.writeFileSync(path.join(temp,"query.json"),q);fs.writeFileSync(path.join(temp,"response.json"),r);
 const native=execFileSync("go",["run","./cmd/esplain","-query",path.join(temp,"query.json"),"-response",path.join(temp,"response.json")],{encoding:"utf8"});
 assert.equal(native,JSON.parse(explainQuery(q,r)).report,"native/Wasm report parity");
 // Only these explicitly created test fixture files are removed.
 fs.unlinkSync(path.join(temp,"query.json"));fs.unlinkSync(path.join(temp,"response.json"));fs.rmdirSync(temp);
 console.log("Wasm: four presets, bounds, malformed responses, unknown clauses, and native CLI text parity passed");
 process.exit(0);
})().catch(error => { console.error(error); process.exit(1); });
