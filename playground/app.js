"use strict";
const $ = id => document.getElementById(id);
const MAX = 1024 * 1024;
const utf8 = new TextEncoder();
let worker, ready = false, timer, revision = 0, report = "";
function el(tag, text, className) {
 const node = document.createElement(tag);
 if (text !== undefined) node.textContent = text;
 if (className) node.className = className;
 return node;
}
function setError(id, message) {
 const node = $(id + "-error"); node.hidden = !message; node.textContent = message;
 $(id).setAttribute("aria-invalid", String(Boolean(message)));
 if (message) $(id).setAttribute("aria-describedby",id + "-error"); else $(id).removeAttribute("aria-describedby");
}
function validate(id) {
 const raw = $(id).value;
 if (!raw.trim()) { setError(id,id === "query" ? "Paste a query to begin." : ""); return id !== "query"; }
 if (utf8.encode(raw).length > MAX) { setError(id,"Input is larger than 1 MiB. Reduce it before analyzing."); return false; }
 try { const data = JSON.parse(raw); if (!data || Array.isArray(data) || typeof data !== "object") throw new Error("Expected a JSON object."); }
 catch (error) {
  const pos = /position (\d+)/i.exec(error.message);
  const line = pos ? raw.slice(0,Number(pos[1])).split("\n").length : null;
  setError(id,(line ? "Line " + line + ": " : "") + error.message); return false;
 }
 setError(id,""); return true;
}
function updateLines() {
 // Bound gutter generation even for oversized input.
 const lines = Math.min(25000,$("query").value.split("\n").length);
 $("line-numbers").textContent = Array.from({length:lines},(_,i)=>i+1).join("\n");
 $("byte-count").textContent = utf8.encode($("query").value).length.toLocaleString() + " bytes";
 $("line-numbers").scrollTop = $("query").scrollTop;
}
function schedule() {
 revision++; report=""; $("copy").disabled=true; $("result").replaceChildren();
 clearTimeout(timer); updateLines();
 if (ready) $("status").textContent = "Waiting for input…";
 timer = setTimeout(analyze,300);
}
function analyze() {
 const validQuery=validate("query"), validResponse=validate("response");
 if (!validQuery || !validResponse) { $("status").textContent="Fix the input to see a breakdown."; return; }
 if (!ready) return;
 $("status").textContent="Analyzing locally…";
 worker.postMessage({id:revision,query:$("query").value,response:$("response").value});
}
function clauseTree(nodes) {
 const list=el("ul",undefined,"clause-tree");
 for (const node of nodes) {
  const item=el("li"), details=el("details"), summary=el("summary");
  details.open=true; summary.append(el("strong",node.type),el("span",node.role,"badge role-" + node.role));
  details.append(summary,el("p",node.description),el("code",node.path,"query-path"));
  if (node.children?.length) details.append(clauseTree(node.children));
  item.append(details);list.append(item);
 }
 return list;
}
function render(data) {
 const result=$("result");result.replaceChildren();
 if (data.error) { $("status").textContent=data.error; return; }
 report=data.report; $("copy").disabled=false;
 $("status").textContent=data.summary;
 result.append(el("h3","Query clauses"),clauseTree(data.clauses));
 const raw=el("details",undefined,"raw-tree");raw.append(el("summary","Raw query tree"),el("pre",data.report));result.append(raw);
}
$("query").addEventListener("input",schedule);
$("response").addEventListener("input",schedule);
$("query").addEventListener("scroll",()=>$("line-numbers").scrollTop=$("query").scrollTop);
$("format").addEventListener("click",()=>{
 if (!validate("query")) return;
 $("query").value=JSON.stringify(JSON.parse($("query").value),null,2);schedule();
});
async function copyText(text) {
 try { await navigator.clipboard.writeText(text); $("action-status").textContent="Copied."; }
 catch { $("action-status").textContent="Clipboard unavailable. Select the text report below and copy it."; }
}
$("copy").addEventListener("click",()=>copyText(report));
updateLines();
try {
 worker=new Worker("worker.js");
 worker.onmessage=({data})=>{
  if(data.type==="ready"){ready=true;analyze();}
  if(data.type==="fatal"){$("status").textContent="Could not start the Go engine: "+data.error;}
  if(data.type==="result"&&data.id===revision)render(data.result);
 };
 worker.onerror=()=>{$("status").textContent="Could not load the engine. Serve the playground over HTTP and reload.";};
} catch(error) {$("status").textContent=error.message;}
