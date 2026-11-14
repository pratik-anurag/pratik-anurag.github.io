import test from"node:test";import assert from"node:assert/strict";
import{encodeShare,decodeShare}from"../share.js";import{diagramSVG,escapeXML}from"../export.js";import{samples}from"../samples.js";import{parseMachine}from"../parser.js";
test("compressed share links preserve Unicode and complete captures",async()=>{
 for(const sample of samples){const text=sample.text+"\n# Unicode: 東京";const hash=await encodeShare(text);assert.equal(await decodeShare(hash),text);assert.ok(hash.length<text.length);}
});
test("share errors are bounded and invalid links rejected",async()=>{
 await assert.rejects(encodeShare("x".repeat(1048577)));await assert.rejects(decodeShare("#v=1&z=not-base64"));await assert.rejects(decodeShare("#v=2&t=abc"));await assert.rejects(decodeShare("#"+"x".repeat(131073)));
 const bomb=new Uint8Array(await new Response(new Blob(["x".repeat(1048577)]).stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer());await assert.rejects(decodeShare("#v=1&z="+btoa(String.fromCharCode(...bomb))));
});
test("SVG export is standalone and escapes pasted markup",()=>{
 const m=parseMachine(samples[0].text);m.model='<script>alert("x")</script>&';const out=diagramSVG(m);
 assert.ok(out.svg.includes("&lt;script&gt;"));assert.ok(!out.svg.includes("<script>"));assert.ok(!out.svg.includes("foreignObject"));assert.equal(out.width,1280);assert.ok(out.height>100);
 assert.equal(escapeXML("<&"),"&lt;&amp;");
});
test("large-machine SVG includes every hardware thread",()=>{
 const m=parseMachine(samples.find(s=>s.id==="epyc").text);const out=diagramSVG(m,{l1:true,l2:true,l3:true});assert.equal((out.svg.match(/>255<\/text>/g)||[]).length,1);assert.ok(out.svg.includes("L3 #15"));
});
