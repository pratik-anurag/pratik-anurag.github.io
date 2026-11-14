import test from "node:test";
import assert from "node:assert/strict";
import {parseMachine,parseCPUList,formatCPUList,parseSize,cacheSize} from "../parser.js";
const exact=`Architecture: x86_64
CPU(s): 4
Model name: Sample CPU
Socket(s): 1
Thread(s) per core: 2
Core(s) per socket: 2
L2 cache: 2 MiB (2 instances)
L3 cache: 8 MiB (1 instance)
CPU NODE SOCKET CORE L1d:L1i:L2:L3
0 0 0 0 0:0:0:0
1 0 0 1 1:1:1:0
2 0 0 0 0:0:0:0
3 0 0 1 1:1:1:0
available: 1 nodes (0)
node 0 cpus: 0 1 2 3
node 0 size: 8192 MB
node 0 free: 4096 MB
node distances:
node 0
0: 10`;
test("CPU lists match Arpkit range and stride semantics",()=>{
 assert.deepEqual(parseCPUList("0-3,8-12:2"),[0,1,2,3,8,10,12]);assert.equal(formatCPUList([0,1,2,8,9]),"0-2,8-9");
 for(const s of ["3-1","-1","0-1000000000","0-4:0","x"])assert.throws(()=>parseCPUList(s));
});
test("cache totals and fractional binary sizes",()=>{
 assert.equal(parseSize("1.5 MiB"),1572864);assert.equal(cacheSize("32 KiB (16 instances)").perInstance,2048);
 assert.equal(cacheSize("32 KiB").perInstance,32768);assert.equal(parseSize("unknown"),null);
});
test("exact extended mapping and numactl are merged",()=>{
 const m=parseMachine(exact);assert.equal(m.cores.length,2);assert.deepEqual(m.cores[0].cpus,[0,2]);
 assert.equal(m.nodes[0].memory,8192*1024**2);assert.deepEqual(m.distance.matrix,[[10]]);
 assert.equal(m.caches.filter(c=>c.level==="L3").length,1);assert.equal(m.inferred,false);
});
test("lscpu JSON children and mixed text",()=>{
 const raw=JSON.stringify({lscpu:[{field:"Architecture:",data:"aarch64",children:[{field:"CPU(s):",data:"2"}]},{field:"Socket(s):",data:"1"},{field:"Thread(s) per core:",data:"1"}]});
 const m=parseMachine(raw+"\nnode 0 cpus: 0 1\nnode 0 size: 1024 MB");
 assert.equal(m.architecture,"aarch64");assert.equal(m.cpus.length,2);assert.equal(m.inferred,true);
});
test("unknowns, partial input and malformed sections do not throw",()=>{
 for(const raw of ["","garbled",'{ "lscpu": [',"CPU NODE SOCKET CORE L1d:L1i:L2:L3\n0 0", "node 0 cpus: 1-a", "x".repeat(1048577)]){
  const m=parseMachine(raw);assert.ok(m.diagnostics.length);
 }
 const m=parseMachine("CPU NODE SOCKET CORE L1d:L1i:L2:L3\n7 - - - -:-:-:-");assert.equal(m.cpus[0].socket,null);assert.equal(m.cores[0].id,null);
});
test("summary grouping is explicitly inferred",()=>{
 const m=parseMachine("CPU(s): 16\nSocket(s): 1\nThread(s) per core: 2\nCore(s) per socket: 8\nL3 cache: 16 MiB (2 instances)");
 assert.equal(m.cpus.length,16);assert.equal(m.cores.length,8);assert.ok(m.caches.every(c=>c.inferred));assert.ok(m.cpus.every(c=>!c.idExact));
});
test("partial matrices preserve missing rows rather than fabricating distances",()=>{
 const m=parseMachine("node 2 cpus: 0\nnode 5 cpus: 1\nnode distances:\nnode 2 5\n2: 10 21");
 assert.deepEqual(m.distance.ids,[2,5]);assert.deepEqual(m.distance.matrix,[[10,21],[]]);assert.ok(m.diagnostics.length);
});
test("disjoint per-node ranges respect the global CPU bound",()=>{
 const m=parseMachine("node 0 cpus: 0-8191\nnode 1 cpus: 8192-16383");assert.equal(m.cpus.length,8192);assert.ok(m.diagnostics.some(d=>d.section==="CPU limit"));
});
