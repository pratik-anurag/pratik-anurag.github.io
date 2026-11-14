// Anonymized, synthetic command captures in util-linux/numactl format.
// IDs and sharing below are fixture data, not measurements of the visitor's device.
const summary=`Architecture: x86_64
CPU(s): 16
On-line CPU(s) list: 0-15
Model name: Intel(R) Core(TM) i7-1185G7 (sample)
Thread(s) per core: 2
Core(s) per socket: 8
Socket(s): 1
NUMA node(s): 1
L1d cache: 256 KiB (8 instances)
L1i cache: 256 KiB (8 instances)
L2 cache: 4 MiB (8 instances)
L3 cache: 16 MiB (1 instance)
NUMA node0 CPU(s): 0-15`;
const rows=Array.from({length:16},(_,id)=>id+" 0 0 "+id%8+" "+[id%8,id%8,id%8,0].join(":")).join("\n");
export const samples=[{id:"laptop",label:"Laptop · 8 cores / 16 threads",text:summary+"\nCPU NODE SOCKET CORE L1d:L1i:L2:L3\n"+rows+`
available: 1 nodes (0)
node 0 cpus: 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15
node 0 size: 32768 MB
node 0 free: 16384 MB
node distances:
node   0
  0:  10`}];
