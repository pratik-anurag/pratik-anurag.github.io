import test from "node:test";import assert from "node:assert/strict";
import {samples}from "../samples.js";import {parseMachine}from "../parser.js";
const expected={xeon:[64,32,2,2,2],epyc:[256,128,2,8,16],laptop:[16,8,1,1,1],arm:[64,64,1,1,1],hybrid:[24,16,1,1,1]};
for(const sample of samples)test("complete capture: "+sample.id,()=>{
 const m=parseMachine(sample.text);const e=expected[sample.id];assert.equal(m.cpus.length,e[0]);assert.equal(m.cores.length,e[1]);assert.equal(m.sockets.length,e[2]);assert.equal(m.nodes.length,e[3]);assert.equal(m.caches.filter(c=>c.level==="L3").length,e[4]);assert.equal(m.inferred,false);assert.equal(m.diagnostics.length,0);
 assert.equal(m.distance.matrix.length,e[3]);assert.ok(m.cpus.every(c=>c.L2&&c.L3));assert.ok(m.nodes.every(n=>n.memory>0));
 if(sample.id==="hybrid"){assert.equal(m.cores.filter(c=>c.kind.startsWith("P-")).length,8);assert.equal(m.cores.filter(c=>c.kind.startsWith("E-")).length,8);}
 if(sample.id==="arm")assert.ok(m.cores.every(c=>c.cpus.length===1));
});
test("all samples remain useful without their extended table",()=>{
 for(const sample of samples){
  const summary=sample.text.split("CPU NODE")[0];const m=parseMachine(summary);
  assert.ok(m.cpus.length);assert.equal(m.inferred,true);assert.ok(m.caches.every(c=>c.inferred));
 }
});
test("JSON summary versions retain their cache instance counts",()=>{
 const m=parseMachine(JSON.stringify({lscpu:[{field:"CPU(s):",data:"4"},{field:"Socket(s):",data:"1"},{field:"Thread(s) per core:",data:"1"},{field:"L3 cache:",data:"1.5 MiB (1 instance)"}]}));
 assert.equal(m.cacheSummary.L3.perInstance,1572864);assert.equal(m.cpus.length,4);
});
