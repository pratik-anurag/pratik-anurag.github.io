import {parseMachine,formatCPUList} from "./parser.js";
import {samples} from "./samples.js";
import {relativeDistance,distanceDescription} from "./distance.js";
import {posture,pinning}from "./insights.js";
import {encodeShare,decodeShare}from "./share.js";
import {diagramSVG}from "./export.js";
const $=id=>document.getElementById(id);
export const element=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
export function bytes(value){if(value===null||value===undefined)return "unknown";if(value===0)return "0 B";const units=["B","KiB","MiB","GiB","TiB","PiB"];const i=Math.min(units.length-1,Math.max(0,Math.floor(Math.log(value)/Math.log(1024))));return (value/1024**i).toLocaleString(undefined,{maximumFractionDigits:1})+" "+units[i];}
let machine=null,timer,selected=null;
const tag=(text,cls="")=>element("span",text,"badge "+cls);
function cacheLabel(cache){return cache?cache.level+" #"+cache.id+" · "+bytes(cache.bytes)+(cache.sizeAverage?" avg":"")+(cache.inferred?" · inferred":""):"sharing unknown";}
function summary(m){
 const host=$("summary");host.replaceChildren();
 const smt=m.inferred?(m.reported.threadsPerCore===null?"unknown":m.reported.threadsPerCore>1?"on (reported)":"off (reported)"):(m.cpus.some(c=>c.core===null)?"unknown":m.cores.some(c=>c.cpus.length>1)?"on":"off");
 const total=m.nodes.every(n=>n.memory!==null)&&m.nodes.length?m.nodes.reduce((s,n)=>s+n.memory,0):null;
 const groups=[["Model",m.model],["Topology",(m.reported.sockets??(m.sockets.filter(s=>s.id!==null).length||"unknown"))+" sockets · "+(m.reported.coresPerSocket&&m.reported.sockets?m.reported.coresPerSocket*m.reported.sockets:m.cores.length||"unknown")+" cores · "+m.cpus.length+" threads"],["NUMA / memory",m.nodes.length+" nodes · "+bytes(total)],["SMT",smt]];
 for(const level of ["L1d","L1i","L2","L3"]){const c=m.cacheSummary[level];groups.push([level,c?bytes(c.totalBytes??c.rawBytes)+(c.instances?" total / "+c.instances+" instances":" (scope unknown)"):"size unknown"]);}
 for(const [label,value]of groups){const cell=element("div");cell.append(element("small",label),element("strong",value));host.append(cell);}
}
function cpuButton(cpu,m){
 const button=element("button",String(cpu.id),"cpu"+(!cpu.idExact?" inferred":""));button.type="button";button.dataset.cpu=cpu.id;button.dataset.core=cpu.coreKey;button.dataset.node=String(cpu.node);button.dataset.l2=cpu.L2??"";button.dataset.l3=cpu.L3??"";
 button.setAttribute("aria-label","CPU "+cpu.id+", core "+(cpu.core??"unknown")+", socket "+(cpu.socket??"unknown")+", NUMA "+(cpu.node??"unknown")+(cpu.inferred?", inferred mapping":""));
 button.setAttribute("aria-pressed","false");button.title=cpuDetails(cpu,m);return button;
}
function cpuDetails(cpu,m){
 const siblings=m.cores.find(c=>c.key===cpu.coreKey)?.cpus??[];
 return "CPU "+cpu.id+" · socket "+(cpu.socket??"unknown")+" · NUMA "+(cpu.node??"unknown")+" · core "+(cpu.core??"unknown")+" · siblings "+formatCPUList(siblings)+(cpu.inferred?" (inferred)":"")+" · "+["L1d","L1i","L2","L3"].map(level=>{const c=m.caches.find(c=>c.key===cpu[level]);return c?cacheLabel(c):level+" unknown";}).join(" · ")+(cpu.maxMHz?" · max "+cpu.maxMHz+" MHz":"");
}
function highlightCPU(id){
 const cpu=id===null||id===undefined?null:machine?.cpus.find(c=>c.id===Number(id));
 for(const b of $("diagram").querySelectorAll(".cpu")){
  b.classList.toggle("selected",Boolean(cpu)&&b.dataset.cpu===String(cpu.id));
  b.classList.toggle("sibling",Boolean(cpu)&&b.dataset.core===cpu.coreKey);
  b.classList.toggle("shared-l2",Boolean(cpu?.L2)&&b.dataset.l2===cpu.L2);
  b.classList.toggle("shared-l3",Boolean(cpu?.L3)&&b.dataset.l3===cpu.L3);
  b.setAttribute("aria-pressed",String(selected!==null&&b.dataset.cpu===String(selected)));
 }
 for(const n of $("diagram").querySelectorAll(".numa"))n.classList.toggle("active-node",Boolean(cpu)&&n.dataset.node===String(cpu.node));
 $("selection").textContent=cpu?cpuDetails(cpu,machine):"Hover, focus, or select a CPU. Click again or press Escape to clear.";
}
function coreBox(core,m){
 const box=element("div",undefined,"core "+(core.inferred?"inferred ":"")+(core.kind.startsWith("P-")?"p-core":core.kind.startsWith("E-")?"e-core":""));
 box.append(element("span","Core "+(core.id??"?")+(core.inferred?" · inferred":""),"core-label"));
 if(core.kind!=="unknown")box.append(element("small",core.kind));
 if($("show-l1").checked){for(const level of ["L1d","L1i"]){const cpu=m.cpus.find(c=>c.id===core.cpus[0]);const c=m.caches.find(c=>c.key===cpu?.[level]);box.append(element("small",level+": "+(c?cacheLabel(c):"unknown"),"cache-caption"));}}
 const threads=element("div",undefined,"threads");for(const id of core.cpus){const cpu=m.cpus.find(c=>c.id===id);threads.append(cpuButton(cpu,m));}box.append(threads);return box;
}
function grouped(list,getKey){const map=new Map();for(const item of list){const k=getKey(item)??"unknown";if(!map.has(k))map.set(k,[]);map.get(k).push(item);}return map;}
function renderNode(m,node,socketCPUs){
 const nodeCPUs=m.cpus.filter(c=>socketCPUs.includes(c.id)&&c.node===node.id);
 const box=element("section",undefined,"numa node-"+(node.id===null?"unknown":node.id%8));box.dataset.node=String(node.id);
 const head=element("h4","NUMA "+(node.id??"unknown")+" · "+nodeCPUs.length+" threads");box.append(head);
 const memory=element("p",node.id===null?"Memory unknown":bytes(node.memory)+" memory · "+bytes(node.free)+" free","node-memory");box.append(memory);
 if(node.memory>0&&node.free!==null){const meter=element("meter");meter.min=0;meter.max=node.memory;meter.value=Math.min(node.memory,node.free);meter.setAttribute("aria-label","Free memory on NUMA "+node.id);box.append(meter);}
 const cores=m.cores.filter(c=>c.cpus.some(id=>nodeCPUs.some(t=>t.id===id)));
 const l3Groups=grouped(cores,c=>m.cpus.find(t=>t.id===c.cpus[0])?.L3);
 for(const [key,group]of l3Groups){
  const cache=m.caches.find(c=>c.key===key);const section=element("details",undefined,"llc "+(cache?.inferred?"inferred":""));section.open=m.cores.length<=32&&group.length<=8;
  const title=($("show-l3").checked?"L3 "+(cache?"#"+cache.id+" · "+bytes(cache.bytes)+(cache.sizeAverage?" avg":"")+(cache.inferred?" · inferred":""):"sharing unknown"):"Core group")+" · "+group.length+" cores";
  section.append(element("summary",title+(group.length>8?" · expand":"")));
  if(cache&&cache.cpus.some(id=>!nodeCPUs.some(c=>c.id===id)))section.append(element("p","This is one node/socket slice of a shared cache group.","muted"));
  const inner=element("div",undefined,"cache-grid");
  const l2Groups=$("show-l2").checked?grouped(group,c=>m.cpus.find(t=>t.id===c.cpus[0])?.L2):new Map([["hidden",group]]);
  for(const [l2,cs]of l2Groups){const block=element("div",undefined,"l2-group");const cache2=m.caches.find(c=>c.key===l2);if($("show-l2").checked)block.append(element("div",cache2?cacheLabel(cache2):"L2 sharing unknown","cache-caption"));for(const core of cs)block.append(coreBox(core,m));inner.append(block);}
  section.append(inner);box.append(section);
 }
 if(!nodeCPUs.length)box.append(element("p","No supplied CPU rows in this node.","muted"));
 return box;
}
export function renderTopology(m){
 const root=$("diagram");root.replaceChildren();
 if(!m.cpus.length&&!m.nodes.length){root.append(element("p","No topology to draw.","muted"));return;}
 for(const socket of m.sockets){
  const section=element("section",undefined,"socket");section.append(element("h3","Socket "+(socket.id??"unknown")));
  const nodeIDs=[...new Set(m.cpus.filter(c=>socket.cpus.includes(c.id)).map(c=>c.node))];
  // Keep memory-only nodes visible without assigning them to an invented socket.
  if(socket.id===null)for(const node of m.nodes)if(!node.cpus.length)nodeIDs.push(node.id);
  const list=element("div",undefined,"node-grid");
  for(const id of [...new Set(nodeIDs)]){const node=m.nodes.find(n=>n.id===id)??{id:null,memory:null,free:null};list.append(renderNode(m,node,socket.cpus));}
  section.append(list);root.append(section);
 }
 const memoryOnly=m.nodes.filter(n=>!n.cpus.length);
 if(memoryOnly.length&&!m.sockets.some(s=>s.id===null)){const section=element("section",undefined,"socket");section.append(element("h3","Socket unknown · memory-only nodes"));for(const node of memoryOnly)section.append(renderNode(m,node,[]));root.append(section);}
 const alternative=$("topology-list");alternative.replaceChildren();
 const list=element("ul");for(const socket of m.sockets){const item=element("li","Socket "+(socket.id??"unknown"));const children=element("ul");for(const core of m.cores.filter(c=>c.cpus.some(id=>socket.cpus.includes(id))))children.append(element("li","NUMA "+(core.node??"unknown")+", core "+(core.id??"unknown")+", CPUs "+formatCPUList(core.cpus)+(core.inferred?" (inferred)":"")));item.append(children);list.append(item);}alternative.append(list);
 highlightCPU(selected);
}
function textSummary(m){return ["Arpkit Visualizer",m.model,"Formats: "+m.formats.join(", "),"Threads: "+m.cpus.length+" / cores: "+m.cores.length+" / nodes: "+m.nodes.length,m.inferred?"Mapping contains inferred groups.":"Mapping from supplied extended CPU rows.",...m.nodes.map(n=>"NUMA "+n.id+": CPUs "+formatCPUList(n.cpus)+"; memory "+bytes(n.memory)+"; free "+bytes(n.free)),...m.caches.map(c=>cacheLabel(c)+"; CPUs "+formatCPUList(c.cpus))].join("\n");}
function renderDistances(m){
 const host=$("distance");host.replaceChildren();
 if(!m.distance.ids.length){host.append(element("p","Distance matrix unavailable. Paste numactl --hardware.","muted"));return;}
 const table=element("table",undefined,"distance-table");table.append(element("caption","Node distances · local is usually 10"));
 const header=element("tr");header.append(element("th","From / to"));
 const ids=m.distance.ids.slice(0,32);for(const id of ids){const th=element("th",String(id));th.scope="col";header.append(th);}
 const head=element("thead");head.append(header);table.append(head);const body=element("tbody");
 for(let i=0;i<ids.length;i++){
  const row=element("tr"),label=element("th",String(ids[i]));label.scope="row";row.append(label);
  for(let j=0;j<ids.length;j++){
   const value=m.distance.matrix[i]?.[j],ratio=relativeDistance(m.distance,i,j),cell=element("td");
   const button=element("button",value===undefined?"?":String(value),"distance-cell "+(ratio===null?"distance-unknown":i===j?"distance-local":ratio<=2?"distance-near":"distance-far"));
   button.type="button";button.title=distanceDescription(m.distance,i,j);button.setAttribute("aria-label",button.title);
   for(const event of ["pointerenter","focus","click"])button.addEventListener(event,()=>{$("distance-detail").textContent=button.title;});
   cell.append(button);row.append(cell);
  }
  body.append(row);
 }
 table.append(body);const scroll=element("div",undefined,"heatmap-scroll");scroll.tabIndex=0;scroll.setAttribute("aria-label","Scrollable NUMA distance matrix");scroll.append(table);host.append(scroll,element("p","Focus or hover a cell for its local-relative cost.","muted"));const detail=element("p","", "distance-detail");detail.id="distance-detail";detail.setAttribute("role","status");host.append(detail);
 if(m.distance.ids.length>32)host.append(element("p","Showing the first 32 nodes. The text summary includes the full supplied matrix.","muted"));
}
function analyze(){
 selected=null;machine=parseMachine($("input").value);summary(machine);renderTopology(machine);
 renderDistances(machine);
 const findings=posture(machine);$("insights").replaceChildren(element("p","Partial posture: no full score is computed without isolation and governor data.","muted"));
 for(const f of [...findings.checks,...findings.extras]){
  const card=element("article",undefined,"finding");card.append(tag(f.severity,f.severity),element("strong",f.name),tag(f.status),element("small",f.source),element("p",f.reason),element("p",f.fix,"muted"));$("insights").append(card);
 }
 const binding=pinning(machine);$("pinning").replaceChildren(element("p",binding.note,"muted"),...binding.commands.map(cmd=>element("pre",cmd)));
 $("diagnostics").replaceChildren(...machine.diagnostics.map(d=>{const p=element("p",undefined,"diagnostic");p.append(tag(d.severity),document.createTextNode(" "+d.section+": "+d.message));return p;}));
 $("status").textContent=machine.formats.length?"Detected: "+machine.formats.join(" + ")+(machine.inferred?" · inferred grouping":""):"";
 $("terminal").textContent=textSummary(machine);
 $("terminal").textContent+="\n\nPerformance posture (partial; no full CLI score)\n"+[...findings.checks,...findings.extras].map(f=>"["+f.source+" / "+f.status+"] "+f.name+": "+f.reason).join("\n");
 if(machine.distance.ids.length)$("terminal").textContent+="\n\nNUMA distances (columns "+machine.distance.ids.join(", ")+")\n"+machine.distance.ids.map((id,i)=>id+": "+machine.distance.matrix[i]?.join(" ")).join("\n");
 for(const id of ["svg","png","copy"])$(id).disabled=!machine.cpus.length&&!machine.nodes.length;
}
const custom=element("option","Custom capture");custom.value="custom";$("sample").append(custom);
for(const sample of samples){const option=element("option",sample.label);option.value=sample.id;$("sample").append(option);}
$("sample").addEventListener("change",()=>{const sample=samples.find(s=>s.id===$("sample").value);if(sample){$("input").value=sample.text;analyze();}});
$("input").addEventListener("input",()=>{$("sample").value="custom";clearTimeout(timer);timer=setTimeout(analyze,250);});
for(const id of ["show-l1","show-l2","show-l3"])$(id).addEventListener("change",()=>{if(machine)renderTopology(machine);});
$("sample").value=samples[0].id;$("input").value=samples[0].text;analyze();
for(const event of ["pointerover","focusin"])$("diagram").addEventListener(event,e=>{const b=e.target.closest(".cpu");if(b)highlightCPU(b.dataset.cpu);});
$("diagram").addEventListener("pointerleave",()=>highlightCPU(selected));
$("diagram").addEventListener("focusout",e=>{if(!$("diagram").contains(e.relatedTarget))highlightCPU(selected);});
$("diagram").addEventListener("click",e=>{const b=e.target.closest(".cpu");if(b){const id=Number(b.dataset.cpu);selected=selected===id?null:id;highlightCPU(selected);}});
$("diagram").addEventListener("keydown",e=>{if(e.key==="Escape"){selected=null;highlightCPU(null);}});
async function copy(text){try{await navigator.clipboard.writeText(text);$("action-status").textContent="Copied.";}catch{$("copy-fallback").hidden=false;$("copy-fallback").value=text;$("copy-fallback").focus();$("copy-fallback").select();$("action-status").textContent="Clipboard unavailable. Copy the selected text below.";}}
$("copy").addEventListener("click",()=>copy($("terminal").textContent));
$("share").addEventListener("click",async()=>{try{const hash=await encodeShare($("input").value);history.replaceState(null,"",hash);await copy(location.href);}catch(e){$("action-status").textContent=e.message;}});
async function restore(){if(!location.hash.startsWith("#v="))return;try{$("input").value=await decodeShare(location.hash);$("sample").value="custom";analyze();}catch(e){$("action-status").textContent="Cannot restore share link: "+e.message;}}
window.addEventListener("hashchange",restore);restore();
function download(blob,name){const url=URL.createObjectURL(blob),link=element("a");link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
const exported=()=>diagramSVG(machine,{l1:$("show-l1").checked,l2:$("show-l2").checked,l3:$("show-l3").checked});
$("svg").addEventListener("click",()=>{const {svg}=exported();download(new Blob([svg],{type:"image/svg+xml"}),"arpkit-topology.svg");$("action-status").textContent="SVG exported with every core expanded.";});
$("png").addEventListener("click",async()=>{
 let url;
 try{
  $("action-status").textContent="Rendering PNG…";const {svg,width,height}=exported();
  const scale=Math.min(2,Math.sqrt(16000000/(width*height)),16384/height);
  const canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(width*scale));canvas.height=Math.max(1,Math.round(height*scale));const ctx=canvas.getContext("2d");if(!ctx)throw new Error("Canvas export is unavailable.");
  url=URL.createObjectURL(new Blob([svg],{type:"image/svg+xml"}));const image=new Image();await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(new Error("Could not rasterize the SVG. Download SVG instead."));image.src=url;});
  ctx.drawImage(image,0,0,canvas.width,canvas.height);const blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/png"));if(!blob)throw new Error("PNG export failed. Try SVG.");
  download(blob,"arpkit-topology.png");$("action-status").textContent="PNG exported"+(scale<1?" at reduced scale to fit the image-size limit.":".");
 }catch(e){$("action-status").textContent=e.message;}finally{if(url)URL.revokeObjectURL(url);}
});
