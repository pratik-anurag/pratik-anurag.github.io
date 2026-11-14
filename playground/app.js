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
 $("mode").textContent=data.runtime ? "Static + pasted runtime" : "Static analysis";
 $("status").textContent=data.summary;
 result.append(el("h3","Query clauses"),clauseTree(data.clauses));
 result.append(el("h3","Analysis findings"));
 if (!data.findings.length) result.append(el("p","No configured static rules triggered. This does not guarantee a fast query.","muted"));
 for(const finding of data.findings){
  const card=el("article",undefined,"finding");
  card.append(el("span",finding.severity,"badge severity-"+finding.severity),el("p",finding.message),el("p","Fix: "+finding.fix,"muted"),el("code",finding.path,"query-path"));
  result.append(card);
 }
 if (data.runtime) renderRuntime(result,data.runtime);
 const raw=el("details",undefined,"raw-tree");raw.append(el("summary","Raw query tree"),el("pre",data.report));result.append(raw);
}
function scoreTree(node) {
 const details=el("details",undefined,"score-node");details.open=true;
 const summary=el("summary");summary.append(el("strong",Number(node.value).toPrecision(5)),document.createTextNode(" · "+node.description));details.append(summary);
 const list=el("ul",undefined,"clause-tree");
 for(const child of node.children || []) {
  const li=el("li");li.append(scoreTree(child));
  if (/sum of/i.test(node.description) && node.value!==0) li.append(el("small",(child.value/node.value*100).toFixed(1)+"% of this sum","muted"));
  list.append(li);
 }
 if(list.children.length)details.append(list);return details;
}
function renderRuntime(result,runtime) {
 if(runtime.validation) {
  const card=el("section",undefined,"finding");
  card.append(el("h3","Validate response"),el("span",runtime.validation.valid ? "Valid" : "Invalid","badge "+(runtime.validation.valid?"":"severity-risk")));
  for(const text of runtime.validation.explanations)card.append(el("p",text));
  result.append(card);
 }
 if(runtime.score){
  result.append(el("h3","Score computation"),el("p","Values and branch descriptions come from the pasted explanation. Products are not additive contributions.","muted"),scoreTree(runtime.score));
  if(runtime.explain)result.append(el("p","Document "+runtime.explain.ID+" · matched: "+runtime.explain.Matched,"muted"));
 }
 if(runtime.timings?.length) {
  const total=runtime.totalNanos;
  result.append(el("h3","Profile timings"));
  result.append(el("p","Root query time sum: "+(total/1e6).toFixed(3)+" ms. This is not search latency. Shards may run in parallel; nested times are inclusive.","muted"));
  result.append(el("p","Slowest root: "+runtime.slowest+" · "+(runtime.maxNanos/1e6).toFixed(3)+" ms · "+(total?runtime.maxNanos/total*100:0).toFixed(1)+"% of root time.","timing-callout"));
  const drawTimings=(nodes,container,depth)=>{
   for(const node of nodes){
    const row=el("div",undefined,"timing-row"+(depth===0&&node.nanos===runtime.maxNanos?" slowest":""));
    row.append(el("p",node.name),el("small",node.shard+" · search "+node.search+" · "+node.type,"muted"));
    const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
    svg.setAttribute("viewBox","0 0 100 4");svg.setAttribute("preserveAspectRatio","none");svg.setAttribute("aria-hidden","true");
    const rect=document.createElementNS(svg.namespaceURI,"rect");rect.setAttribute("height","4");rect.setAttribute("width",String(total?node.nanos/total*100:0));svg.append(rect);
    row.append(svg,el("small",(node.nanos/1e6).toFixed(3)+" ms · "+(total?node.nanos/total*100:0).toFixed(1)+"% of root time"));
    if(node.children.length){const children=el("details",undefined,"timing-children");children.open=true;children.append(el("summary","Child timings (included in parent)"));drawTimings(node.children,children,depth+1);row.append(children);}
    container.append(row);
   }
  };
  drawTimings(runtime.timings,result,0);
 } else if(runtime.timings) result.append(el("p","No query profile timings in this response.","muted"));
}
for(const sample of samples){const option=el("option",sample.label);option.value=sample.id;$("preset").append(option);}
$("preset").addEventListener("change",()=>{
 const sample=samples.find(s=>s.id===$("preset").value);if(!sample)return;
 $("query").value=JSON.stringify(sample.query,null,2);$("response").value=sample.response?JSON.stringify(sample.response,null,2):"";
 if(sample.response)$("response").closest("details").open=true;
 $("action-status").textContent=sample.response?"Sample response is illustrative, not a benchmark.":"";
 schedule();
});
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
