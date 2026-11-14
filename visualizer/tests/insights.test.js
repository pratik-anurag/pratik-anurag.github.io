import test from "node:test";import assert from "node:assert/strict";
import {posture,pinning}from "../insights.js";import{parseMachine}from "../parser.js";
const model=(mem,matrix)=>({nodes:mem.map((memory,id)=>({id,memory,cpus:[id],cpusKnown:true})),distance:{ids:mem.map((_,i)=>i),matrix},cores:[],cpus:[],sockets:[],caches:[],reported:{}});
test("posture preserves Arpkit thresholds",()=>{
 assert.equal(posture(model([50,50],[[10,30],[30,10]])).checks[0].status,"pass");
 assert.equal(posture(model([50,50],[[10,31],[31,10]])).checks[0].status,"warn");
 assert.equal(posture(model([50,50],[[10,21],[22,10]])).checks[0].status,"warn");
 assert.equal(posture(model([57.5,42.5],[[10,21],[21,10]])).checks[1].status,"pass");
 assert.equal(posture(model([58,42],[[10,21],[21,10]])).checks[1].status,"warn");
});
test("unavailable posture stays unknown with no fabricated score",()=>{
 const p=posture(model([null,null],[]));assert.equal(p.checks[0].status,"unknown");assert.equal(p.checks[1].status,"unknown");assert.equal(p.score,null);assert.ok(p.checks.slice(2).every(c=>c.status==="unknown"));
});
test("pinning never uses synthetic CPU IDs and handles memoryless nodes",()=>{
 assert.equal(pinning(parseMachine("CPU(s): 4\nSocket(s): 1\nNUMA node(s): 1\nThread(s) per core: 2")).commands.length,0);
 const m=parseMachine("node 0 cpus: 0-3,8-11\nnode 0 size: 1024 MB");assert.match(pinning(m).commands.join("\n"),/taskset -c 0-3,8-11/);
 const empty=parseMachine("node 0 cpus: 0-3\nnode 0 size: 0 MB");assert.ok(!pinning(empty).commands.join("").includes("membind"));
});
test("extras are separately identified",()=>{const m=model([0,100],[[10,40],[40,10]]);assert.ok(posture(m).extras.every(x=>x.source==="Visualizer extra"));});
