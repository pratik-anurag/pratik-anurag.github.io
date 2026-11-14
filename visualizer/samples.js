// Synthetic, anonymized captures in LC_ALL=C util-linux and numactl format.
// CPU/cache IDs are fixture data, not measurements of a visitor's machine.
function capture({model,arch="x86_64",sockets=1,coresPerSocket=8,tpc=2,nodesPerSocket=1,l3PerSocket=1,memoryMB=32768,cacheSizes,hybrid=false}){
 const cores=sockets*coresPerSocket,threads=cores*tpc,nodeCount=sockets*nodesPerSocket,table=[],nodeCPUs=Array.from({length:nodeCount},()=>[]);
 for(let id=0;id<threads;id++){
  const physical=id%cores,socket=Math.floor(physical/coresPerSocket),core=physical%coresPerSocket,node=socket*nodesPerSocket+Math.floor(core/(coresPerSocket/nodesPerSocket));
  const l3=socket*l3PerSocket+Math.floor(core/(coresPerSocket/l3PerSocket));
  nodeCPUs[node].push(id);
  table.push([id,node,socket,core,[physical,physical,physical,l3].join(":")].map(String).map(v=>v.padStart(7)).join(" "));
 }
 const lines=["Architecture: "+arch,"CPU(s): "+threads,"On-line CPU(s) list: 0-"+(threads-1),"Model name: "+model,"Thread(s) per core: "+tpc,"Core(s) per socket: "+coresPerSocket,"Socket(s): "+sockets,"NUMA node(s): "+nodeCount];
 for(const [level,value]of Object.entries(cacheSizes))lines.push(level+" cache: "+value);
 for(let node=0;node<nodeCount;node++)lines.push("NUMA node"+node+" CPU(s): "+nodeCPUs[node].join(","));
 lines.push("CPU NODE SOCKET CORE L1d:L1i:L2:L3",...table,"available: "+nodeCount+" nodes ("+(nodeCount===1?"0":"0-"+(nodeCount-1))+")");
 for(let node=0;node<nodeCount;node++)lines.push("node "+node+" cpus: "+nodeCPUs[node].join(" "),"node "+node+" size: "+memoryMB+" MB","node "+node+" free: "+Math.floor(memoryMB*.6)+" MB");
 lines.push("node distances:","node "+Array.from({length:nodeCount},(_,i)=>i).join(" "));
 for(let i=0;i<nodeCount;i++)lines.push("  "+i+": "+Array.from({length:nodeCount},(_,j)=>i===j?10:Math.floor(i/nodesPerSocket)===Math.floor(j/nodesPerSocket)?12:nodesPerSocket>1?32:21).join(" "));
 return lines.join("\n");
}
const laptop={id:"laptop",label:"Laptop · 8 cores / 16 threads",text:capture({model:"Intel(R) Core(TM) i7 Laptop CPU (sample)",cacheSizes:{L1d:"384 KiB (8 instances)",L1i:"256 KiB (8 instances)",L2:"10 MiB (8 instances)",L3:"24 MiB (1 instance)"}})};
const xeon={id:"xeon",label:"Dual-socket Xeon · 32 cores / 64 threads",text:capture({model:"Intel(R) Xeon(R) Silver CPU (sample)",sockets:2,coresPerSocket:16,memoryMB:131072,cacheSizes:{L1d:"1.5 MiB (32 instances)",L1i:"1 MiB (32 instances)",L2:"40 MiB (32 instances)",L3:"48 MiB (2 instances)"}})};
const epyc={id:"epyc",label:"AMD EPYC NPS4 · 128 cores / 256 threads",text:capture({model:"AMD EPYC 64-Core Processor (sample)",sockets:2,coresPerSocket:64,nodesPerSocket:4,l3PerSocket:8,memoryMB:65536,cacheSizes:{L1d:"4 MiB (128 instances)",L1i:"4 MiB (128 instances)",L2:"64 MiB (128 instances)",L3:"512 MiB (16 instances)"}})};
const arm={id:"arm",label:"ARM server · 64 cores / no SMT",text:capture({model:"Neoverse-N1 (sample)",arch:"aarch64",coresPerSocket:64,tpc:1,memoryMB:131072,cacheSizes:{L1d:"4 MiB (64 instances)",L1i:"4 MiB (64 instances)",L2:"64 MiB (64 instances)",L3:"32 MiB (1 instance)"}})};
const hybridRows=[];
for(let id=0;id<24;id++){
 const core=id<16?Math.floor(id/2):8+id-16,physical=core;
 const l2=core<8?core:8+Math.floor((core-8)/4),mhz=core<8?5400:4200;
 hybridRows.push([id,0,0,core,[physical,physical,l2,0].join(":"),mhz.toFixed(4)].map(String).join(" "));
}
const hybrid={id:"hybrid",label:"Intel hybrid · 8 P-like + 8 E-like cores",text:`Architecture: x86_64
CPU(s): 24
On-line CPU(s) list: 0-23
Model name: 13th Gen Intel(R) Core(TM) Hybrid CPU (sample)
Thread(s) per core: 2
Core(s) per socket: 16
Socket(s): 1
NUMA node(s): 1
L1d cache: 640 KiB (16 instances)
L1i cache: 768 KiB (16 instances)
L2 cache: 24 MiB (10 instances)
L3 cache: 30 MiB (1 instance)
NUMA node0 CPU(s): 0-23
CPU NODE SOCKET CORE L1d:L1i:L2:L3 MAXMHZ
`+hybridRows.join("\n")+`
available: 1 nodes (0)
node 0 cpus: 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23
node 0 size: 65536 MB
node 0 free: 32768 MB
node distances:
node 0
  0: 10`};
export const samples=[xeon,epyc,laptop,arm,hybrid];
