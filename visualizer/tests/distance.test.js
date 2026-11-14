import test from "node:test";import assert from "node:assert/strict";
import {relativeDistance,distanceDescription}from "../distance.js";
test("cost is normalized to the actual row-local baseline",()=>{
 const d={ids:[2,5],matrix:[[10,21],[42,20]]};assert.equal(relativeDistance(d,0,1),2.1);assert.equal(relativeDistance(d,1,0),2.1);assert.match(distanceDescription(d,0,1),/2.10× local/);
});
test("missing distance and zero baseline remain unknown",()=>{assert.equal(relativeDistance({matrix:[[0,21]]},0,1),null);assert.equal(relativeDistance({matrix:[[10]]},0,1),null);});
