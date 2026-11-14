// Arpkit posture port from d4ba57a17eb42ba7b2cc8beeab0cc924cfa6e7f4.
// NUMA distance threshold >30 and memory-share spread >15 percentage points
// match internal/posture/posture.go. Unknown input stays unknown.
import {formatCPUList}from "./parser.js";
export function posture(m){
 const checks=[],extras=[];
 const add=(name,status,reason,fix)=>checks.push({name,status,severity:status==="warn"?"warn":"info",reason,fix,source:"Arpkit rule"});
 const ids=m.distance.ids,matrix=m.distance.matrix,n=m.nodes.length;
 if(n===1||ids.length===1)add("NUMA balance","pass","Single NUMA node.","No cross-node placement is needed.");
 else if(!ids.length||matrix.length!==ids.length||matrix.some(row=>row.length!==ids.length||row.some(v=>!Number.isFinite(v)||v<=0)))add("NUMA balance","unknown","Distance matrix unavailable or incomplete.","Paste the complete numactl --hardware output.");
 else{
  let symmetric=true,max=0;
  for(let i=0;i<ids.length;i++)for(let j=0;j<ids.length;j++){if(matrix[i][j]!==matrix[j][i])symmetric=false;if(i!==j)max=Math.max(max,matrix[i][j]);}
  if(!symmetric)add("NUMA balance","warn","Distance matrix not symmetric.","Check the capture and the host's NUMA configuration.");
  else add("NUMA balance",max>30?"warn":"pass",(max>30?"High inter-node distance (":"Max node distance ")+max+(max>30?")":""),"Keep processes and their memory on the same NUMA node where practical.");
 }
 const known=m.nodes.length>0&&m.nodes.every(n=>n.memory!==null),total=m.nodes.reduce((sum,n)=>sum+(n.memory??0),0);
 if(!known||!total)add("Memory symmetry","unknown","Memory distribution unavailable.","Paste node size lines from numactl --hardware.");
 else if(m.nodes.length===1)add("Memory symmetry","pass","Single NUMA memory pool.","No cross-node memory imbalance is reported.");
 else{
  const shares=m.nodes.map(n=>n.memory/total*100),spread=Math.max(...shares)-Math.min(...shares);
  add("Memory symmetry",spread>15?"warn":"pass","Node spread "+spread.toFixed(1)+" percentage points.","Check DIMM population and node-local memory capacity before pinning.");
 }
 add("Isolation","unknown","Kernel isolation parameters are absent from these command outputs.","Use arpkit --profile=verbose to inspect isolcpus, nohz_full and rcu_nocbs.");
 add("Power governor","unknown","Governor information is absent from these command outputs.","Use arpkit --profile=verbose to inspect the governor and scaling driver.");
 const extra=(name,severity,reason,fix)=>extras.push({name,severity,status:"extra",reason,fix,source:"Visualizer extra"});
 const smt=m.inferred?m.reported.threadsPerCore>1:m.cores.some(c=>c.cpus.length>1);
 if(smt)extra("SMT enabled","info","Sibling hardware threads share a physical core"+(m.inferred?"; pairing is inferred.":"."),"For latency-sensitive workloads, test one thread per core before using all siblings.");
 if(m.nodes.length>1)extra("Multiple NUMA nodes","info","Remote memory access may cost more than local access.","Use numactl --cpunodebind and --membind with the same suitable node.");
 const llc=m.caches.filter(c=>c.level==="L3");
 if(llc.length>Math.max(1,m.sockets.filter(s=>s.id!==null).length))extra("Split LLC groups","info",llc.length+" L3 sharing groups are shown"+(llc.some(c=>c.inferred)?" (inferred).":"."),"Keep communicating threads inside one L3 group when cache locality matters; group count alone does not prove CCD/CCX boundaries.");
 for(const node of m.nodes){
  if(node.cpus.length&&node.memory===0)extra("Memoryless NUMA "+node.id,"risk","This node has CPUs but reports no local memory.","Bind memory to a node with capacity; do not use --membind on this node.");
  if(node.cpusKnown&&!node.cpus.length&&node.memory>0)extra("CPU-less NUMA "+node.id,"info","This node has memory but no listed CPUs.","Treat this as a memory target; place execution on a node that has CPUs.");
 }
 for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){
  const d=matrix[i]?.[j];if(d>30)extra("Distant pair "+ids[i]+" → "+ids[j],"warn","Reported relative distance is "+d+" (Arpkit warns above 30).","Avoid this cross-node path for frequently accessed memory when possible.");
 }
 return {checks,extras,score:null};
}
export function pinning(m){
 const preferred=m.nodes.find(n=>n.id===0)??m.nodes.find(n=>n.cpus.length);
 if(!preferred)return {commands:[],note:"NUMA CPU membership is unknown. Paste numactl --hardware or extended lscpu."};
 // numactl lists are exact even if the socket/core layout was inferred.
 const ids=preferred.cpus.filter(id=>{const cpu=m.cpus.find(c=>c.id===id);return preferred.verifiedCPUs?.includes(id)||Boolean(cpu?.idExact&&cpu.nodeExact);}).filter(id=>m.cpus.find(c=>c.id===id)?.online!==false);
 if(!ids.length)return {commands:[],note:"Node "+preferred.id+" has no verified CPU list. No pinning command is generated from guessed CPU IDs."};
 const set=formatCPUList(ids),node=preferred.id,commands=["taskset -c "+set+" ./workload"];
 if(preferred.memory>0)commands.unshift("numactl --cpunodebind="+node+" --membind="+node+" ./workload");
 else if(preferred.memory!==0)commands.unshift("numactl --cpunodebind="+node+" ./workload");
 return {commands,note:"Example for node "+node+" using supplied CPU IDs. "+(preferred.memory===0?"This node is memoryless; no memory-binding command is suggested.":preferred.memory===null?"Memory size is unknown; --membind is omitted.":"Replace ./workload with your program and check memory capacity.")};
}
