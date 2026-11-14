// Terminology and CPU range semantics adapted from Arpkit d4ba57a.
// No sysfs/procfs collection is attempted by this browser-only parser.
export const MAX_BYTES=1024*1024;
const LIMIT=8192;
const unique=values=>[...new Set(values)].sort((a,b)=>a-b);
const key=s=>String(s).toLowerCase().replace(/[^a-z0-9]/g,"");
const number=s=>{const n=Number(String(s).trim());return Number.isFinite(n)&&n>=0?n:null;};
const integer=s=>{const n=number(s);return Number.isInteger(n)?n:null;};
export function parseCPUList(raw){
 const values=[];
 if(!String(raw).trim())return values;
 for(const token of String(raw).trim().split(/[\s,]+/)){
  const m=/^(\d+)(?:-(\d+)(?::(\d+))?)?$/.exec(token);
  if(!m)throw new Error("Invalid CPU range: "+token);
  const start=Number(m[1]),end=Number(m[2]??m[1]),stride=Number(m[3]??1);
  if(end<start||end>1000000||stride<1||!Number.isSafeInteger(end)||(end-start)/stride+1>LIMIT)throw new Error("CPU range is descending or exceeds the 8,192-CPU limit.");
  for(let i=start;i<=end;i+=stride){values.push(i);if(values.length>LIMIT)throw new Error("CPU list exceeds 8,192 entries.");}
 }
 return unique(values);
}
export function formatCPUList(values){
 const ids=unique(values);const out=[];
 let start=ids[0],prev=start;
 for(const id of ids.slice(1)){if(id===prev+1){prev=id;continue;}out.push(start===prev?String(start):start+"-"+prev);start=prev=id;}
 if(start!==undefined)out.push(start===prev?String(start):start+"-"+prev);
 return out.join(",");
}
export function parseSize(raw,{decimal=false}={}){
 const m=/^\s*([\d]+(?:[.,]\d+)?)\s*([kmgtpe]?)(i?b)?\b/i.exec(String(raw));
 if(!m)return null;
 const exponent="kmgtpe".indexOf(m[2].toLowerCase())+1;
 const base=decimal&&!m[3]?.toLowerCase().startsWith("i")?1000:1024;
 const bytes=Number(m[1].replace(",","."))*base**exponent;
 return Number.isFinite(bytes)&&bytes<=Number.MAX_SAFE_INTEGER?bytes:null;
}
export function cacheSize(raw){
 const bytes=parseSize(raw);const m=/\((\d+)\s+instances?\)/i.exec(String(raw));
 const instances=m?Number(m[1]):null;
 // util-linux's "(N instances)" values are totals across those N caches.
 return {rawBytes:bytes,totalBytes:instances?bytes:null,perInstance:instances&&bytes!==null?bytes/instances:null,instances,raw:String(raw)};
}
function extractJSON(text,diagnostics){
 const blocks=[];let rest=text;
 while(/(?:^|\n)\s*\{/.test(rest)){
  const start=rest.search(/(?:^|\n)\s*\{/);const brace=rest.indexOf("{",start);
  let depth=0,string=false,escape=false,end=-1;
  for(let i=brace;i<rest.length;i++){const ch=rest[i];if(string){if(escape)escape=false;else if(ch==="\\")escape=true;else if(ch==='"')string=false;}else if(ch==='"')string=true;else if(ch==="{")depth++;else if(ch==="}"&&!--depth){end=i+1;break;}}
  if(end<0){diagnostics.push({severity:"warn",section:"lscpu JSON",message:"Incomplete JSON. Paste the full output of LC_ALL=C lscpu -J."});rest=rest.slice(0,brace)+rest.slice(brace).split("\n").filter(l=>/^node |^available:|^\s+node\b|^\s*\d+:/.test(l)).join("\n");break;}
  try{const parsed=JSON.parse(rest.slice(brace,end));if(!Array.isArray(parsed.lscpu))throw new Error("expected a lscpu array");blocks.push(parsed.lscpu);}
  catch(error){diagnostics.push({severity:"warn",section:"lscpu JSON",message:error.message+". Run LC_ALL=C lscpu -J."});}
  rest=rest.slice(0,brace)+"\n"+rest.slice(end);
 }
 return {blocks,text:rest};
}
export function parseMachine(input){
 const diagnostics=[],formats=new Set(),fields=new Map(),nodes=new Map(),rows=new Map(),distanceRows=new Map();let distanceIDs=[];
 const empty={model:"unknown",architecture:"unknown",cpus:[],cores:[],sockets:[],nodes:[],caches:[],cacheSummary:{},distance:{ids:[],matrix:[]},diagnostics,formats:[],reported:{},inferred:false};
 if(typeof input!=="string"||!input.trim()){diagnostics.push({severity:"info",section:"Input",message:"Paste lscpu or numactl --hardware output, or choose a sample."});return empty;}
 if(new TextEncoder().encode(input).length>MAX_BYTES){diagnostics.push({severity:"risk",section:"Input",message:"Input exceeds 1 MiB. Paste a smaller command capture."});return empty;}
 const ensureNode=id=>{const fresh={id,cpus:[],verifiedCPUs:[],memory:null,free:null,cpusKnown:false};if(!nodes.has(id)){if(nodes.size>=256){if(!diagnostics.some(d=>d.section==="Node limit"))diagnostics.push({severity:"risk",section:"Node limit",message:"Only the first 256 NUMA nodes can be displayed."});return fresh;}nodes.set(id,fresh);}return nodes.get(id);};
 const setField=(name,value)=>{if(typeof value==="string"||typeof value==="number")fields.set(key(name),String(value).trim());};
 const extracted=extractJSON(input.replace(/\x1b\[[0-9;]*m/g,""),diagnostics);
 const flatten=items=>{const stack=[...items];let count=0;while(stack.length&&count++<25000){const f=stack.pop();if(f&&typeof f==="object"){setField(f.field,f.data);if(Array.isArray(f.children))stack.push(...f.children.slice(0,25000));}}};
 for(const block of extracted.blocks){flatten(block);formats.add("lscpu JSON");}
 let table=null,inDistance=false;
 const warn=(section,message)=>diagnostics.push({severity:"warn",section,message});
 for(const line of extracted.text.split(/\r?\n/)){
  const trimmed=line.trim();if(!trimmed)continue;
  const header=trimmed.replace(/^#\s*/,"").split(/\s+/);
  if(header[0]==="CPU"&&header.includes("CORE")){
   table=header;inDistance=false;formats.add("lscpu extended");continue;
  }
  if(/^node distances:/i.test(trimmed)){inDistance=true;table=null;formats.add("numactl");continue;}
  if(inDistance){
   const head=/^node\s+([\d\s]+)$/i.exec(trimmed);if(head){distanceIDs=head[1].trim().split(/\s+/).map(Number);if(distanceIDs.length>256){warn("NUMA distance","Distance matrix is limited to 256 nodes.");distanceIDs=distanceIDs.slice(0,256);}continue;}
   const m=/^(\d+):\s+([\d\s]+)$/.exec(trimmed);if(m){distanceRows.set(Number(m[1]),m[2].trim().split(/\s+/).map(Number));continue;}
   inDistance=false;
  }
  const numa=/^node\s+(\d+)\s+(cpus|size|free):\s*(.*)$/i.exec(trimmed);
  if(numa){formats.add("numactl");table=null;const node=ensureNode(Number(numa[1]));const kind=numa[2].toLowerCase();
   if(kind==="cpus"){try{node.cpus=parseCPUList(numa[3]);node.verifiedCPUs=[...node.cpus];node.cpusKnown=true;}catch(e){warn("numactl CPU list",e.message+" Run numactl --hardware.");}}
   else{const size=parseSize(numa[3]);if(size===null)warn("numactl memory","Cannot parse "+trimmed);else node[kind==="size"?"memory":"free"]=size;}
   continue;
  }
  if(/^available:\s+\d+\s+nodes?/i.test(trimmed)){formats.add("numactl");continue;}
  if(table&&/^\d+\s/.test(trimmed)){
   const cells=trimmed.split(/\s+/);if(cells.length<table.length){warn("lscpu extended","Incomplete CPU row: "+trimmed+". Run lscpu -e=CPU,NODE,SOCKET,CORE,CACHE.");continue;}
   const get=name=>{const i=table.findIndex(t=>key(t)===key(name));return i<0?null:cells[i];};
   const id=integer(get("CPU"));if(id===null||id>1000000||rows.size>=LIMIT){warn("lscpu extended","Invalid CPU ID or more than 8,192 CPU rows.");continue;}
   const cacheColumn=table.findIndex(t=>/^L\d[di]?(?::L\d[di]?)+$/i.test(t));
   const levels=["L1d","L1i","L2","L3"],cache={};
   for(const level of levels){const index=cacheColumn<0?-1:table[cacheColumn].split(":").findIndex(t=>key(t)===key(level));cache[level]=integer(index<0?get(level):cells[cacheColumn].split(":")[index]);}
   const online=get("ONLINE");const cpu={id,node:integer(get("NODE")),socket:integer(get("SOCKET")),core:integer(get("CORE")),cache,maxMHz:number(get("MAXMHZ")),online:online===null?null:!/^(no|n|0)$/i.test(online),inferred:false,nodeExact:true,socketExact:true,coreExact:true,idExact:true};
   if(rows.has(id))warn("lscpu extended","Duplicate CPU "+id+"; last row used.");
   rows.set(id,cpu);continue;
  }
  if(table)table=null;
  const field=/^([^:]+):\s*(.*)$/.exec(trimmed);if(field&&field[2]){setField(field[1],field[2]);formats.add("lscpu text");}
 }
 const get=(...names)=>{for(const name of names){if(fields.has(key(name)))return fields.get(key(name));}return null;};
 const reported={sockets:integer(get("Socket(s)","Sockets")),coresPerSocket:integer(get("Core(s) per socket","Cores per socket")),threadsPerCore:integer(get("Thread(s) per core","Threads per core")),threads:integer(get("CPU(s)","CPUs")),numa:integer(get("NUMA node(s)","NUMA nodes"))};
 const cacheSummary={};for(const level of ["L1d","L1i","L2","L3"]){const value=get(level+" cache",level);if(value)cacheSummary[level]=cacheSize(value);}
 for(const [name,value]of fields){const m=/^numanode(\d+)cpus$/.exec(name);if(m){try{const node=ensureNode(Number(m[1]));if(!node.cpusKnown){node.cpus=parseCPUList(value);node.verifiedCPUs=[...node.cpus];node.cpusKnown=true;}}catch(e){warn("lscpu NUMA list",e.message);}}}
 if(reported.numa&&reported.numa<=256)for(let i=0;i<reported.numa;i++)ensureNode(i);
 if(rows.size){
  for(const cpu of rows.values()){
   const listed=[...nodes.values()].find(n=>n.cpusKnown&&n.cpus.includes(cpu.id));
   if(cpu.node!==null&&listed&&listed.id!==cpu.node)warn("NUMA mapping","CPU "+cpu.id+" disagrees between lscpu and numactl; extended lscpu row takes priority.");
   if(cpu.node===null&&listed){cpu.node=listed.id;cpu.nodeExact=true;}
   if(cpu.node!==null){const n=ensureNode(cpu.node);if(!n.cpus.includes(cpu.id))n.cpus.push(cpu.id);n.verifiedCPUs.push(cpu.id);}
  }
 }else{
  let ids=unique([...nodes.values()].flatMap(n=>n.cpus)),idsExact=ids.length>0;
  const online=get("On-line CPU(s) list","Online CPUs list");
  if(online){try{ids=unique([...ids,...parseCPUList(online)]);idsExact=true;}catch(e){warn("lscpu online list",e.message);}}
  if(!ids.length&&reported.threads&&reported.threads<=LIMIT)ids=Array.from({length:reported.threads},(_,i)=>i);
  if(ids.length>LIMIT){warn("CPU limit","Only the first 8,192 logical CPUs can be displayed.");ids=ids.slice(0,LIMIT);}
  const socketCount=reported.sockets&&reported.sockets<=256?reported.sockets:null;
  const tpc=reported.threadsPerCore||null;
  for(let i=0;i<ids.length;i++){
   const id=ids[i];let node=[...nodes.values()].find(n=>n.cpus.includes(id));const nodeExact=Boolean(node?.cpusKnown);
   if(!node&&nodes.size===1)node=[...nodes.values()][0];
   if(!node&&nodes.size>1)node=[...nodes.values()][Math.min(nodes.size-1,Math.floor(i/Math.ceil(ids.length/nodes.size)))];
   if(node&&!node.cpus.includes(id))node.cpus.push(id);
   const socket=socketCount?Math.min(socketCount-1,Math.floor(i/Math.ceil(ids.length/socketCount))):null;
   const localIndex=socketCount?i%Math.ceil(ids.length/socketCount):i;
   const core=tpc?Math.floor(localIndex/tpc):null;
   rows.set(id,{id,node:node?.id??null,socket,core,cache:{L1d:null,L1i:null,L2:null,L3:null},maxMHz:null,online:null,inferred:true,idExact:idsExact,nodeExact:nodeExact||reported.numa===1,socketExact:socketCount===1,coreExact:false});
  }
  if(ids.length)warn("Topology inference","Socket, core/SMT and cache grouping inferred from summary counts; CPU numbering does not establish siblings. Paste lscpu -e for exact mapping.");
 }
 const cpus=[...rows.values()].sort((a,b)=>a.id-b.id);
 for(const node of nodes.values()){
  if(rows.size&&formats.has("lscpu extended"))node.cpus=node.cpus.filter(id=>!rows.has(id)||rows.get(id).node===node.id);
  node.verifiedCPUs=unique(node.verifiedCPUs.filter(id=>node.cpus.includes(id)));
  node.cpus=unique(node.cpus);
  if(node.free!==null&&node.memory!==null&&node.free>node.memory)warn("numactl memory","Node "+node.id+" free memory exceeds its size; check the pasted capture.");
 }
 // Scope local core IDs by socket; unknown cores remain individually unknown.
 const cores=new Map();
 for(const cpu of cpus){cpu.coreKey=cpu.core===null?"unknown:"+cpu.id:(cpu.socket??"?")+":"+cpu.core;
  if(!cores.has(cpu.coreKey))cores.set(cpu.coreKey,{key:cpu.coreKey,id:cpu.core,socket:cpu.socket,node:cpu.node,cpus:[],inferred:!cpu.coreExact,maxMHz:cpu.maxMHz,kind:"unknown"});
  cores.get(cpu.coreKey).cpus.push(cpu.id);
 }
 const caches=[];
 for(const level of ["L1d","L1i","L2","L3"]){
  const groups=new Map();
  for(const cpu of cpus){const id=cpu.cache[level];if(id===null||id===undefined)continue;const k=(cpu.socket??"?")+":"+id;if(!groups.has(k))groups.set(k,{key:level+":"+k,id,level,cpus:[],inferred:false,bytes:cacheSummary[level]?.perInstance??null});groups.get(k).cpus.push(cpu.id);}
  if(!groups.size&&cpus.length&&cacheSummary[level]){
   const instances=cacheSummary[level].instances??(level==="L3"?reported.sockets:null);
   if(instances&&instances<=LIMIT){
    const list=[...cores.values()];for(let i=0;i<list.length;i++){const bucket=Math.min(instances-1,Math.floor(i/Math.ceil(list.length/instances)));const k=String(bucket);if(!groups.has(k))groups.set(k,{key:level+":inferred:"+k,id:bucket,level,cpus:[],inferred:true,bytes:cacheSummary[level].perInstance});groups.get(k).cpus.push(...list[i].cpus);}
   }
  }
  for(const group of groups.values()){group.sizeAverage=(cacheSummary[level]?.instances??0)>1;caches.push(group);for(const cpu of cpus)if(group.cpus.includes(cpu.id)){cpu[level]=group.key;}}
 }
 const socketIDs=unique(cpus.filter(c=>c.socket!==null).map(c=>c.socket));const sockets=socketIDs.map(id=>({id,cpus:cpus.filter(c=>c.socket===id).map(c=>c.id)}));
 if(cpus.some(c=>c.socket===null))sockets.push({id:null,cpus:cpus.filter(c=>c.socket===null).map(c=>c.id)});
 if(!sockets.length&&nodes.size)sockets.push({id:null,cpus:[]});
 let matrix=[];if(distanceIDs.length&&distanceIDs.length<=256){matrix=distanceIDs.map(id=>distanceRows.get(id)??[]);if(matrix.some(row=>row.length!==distanceIDs.length))warn("NUMA distance","Incomplete distance matrix. Paste the full numactl --hardware output.");}
 if(!cpus.length&&!nodes.size)warn("Input","No topology found. Run LC_ALL=C lscpu; lscpu -e=CPU,NODE,SOCKET,CORE,CACHE; numactl --hardware.");
 if(reported.threads&&cpus.length&&reported.threads!==cpus.length)warn("CPU count","Summary reports "+reported.threads+" CPUs but the mapping contains "+cpus.length+". The diagram shows supplied rows only.");
 const model=get("Model name","CPU model")??"unknown";
 // Frequency clusters are a hint, not proof of Intel core type.
 const freq=unique([...cores.values()].map(c=>c.maxMHz).filter(n=>n!==null));
 if(/intel.*(?:core|ultra)|core.*i[3579]/i.test(model)&&freq.length===2&&freq[1]/freq[0]>1.05){for(const core of cores.values())if(core.maxMHz!==null)core.kind=core.maxMHz===freq[1]?"P-like (inferred)":"E-like (inferred)";}
 return {...empty,model,architecture:get("Architecture")??"unknown",cpus,cores:[...cores.values()],sockets,nodes:[...nodes.values()].sort((a,b)=>a.id-b.id),caches,cacheSummary,distance:{ids:distanceIDs,matrix},formats:[...formats],reported,inferred:cpus.some(c=>c.inferred)};
}
