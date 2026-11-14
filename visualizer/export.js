// Self-contained vector output. Pasted strings are XML-escaped, never markup.
export const escapeXML=value=>String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c]));
const label=value=>escapeXML(String(value).length>86?String(value).slice(0,83)+"…":value);
const colors=["#8edce8","#b9a0e8","#efbe87","#8fd1ad","#e79cb4","#a8bcf2","#c2cc85","#b3bbc4"];
function groupBy(values,key){const groups=new Map();for(const value of values){const k=key(value)??"unknown";if(!groups.has(k))groups.set(k,[]);groups.get(k).push(value);}return groups;}
export function diagramSVG(m,{l1=false,l2=true,l3=true}={}){
 const shapes=[];const rect=(x,y,w,h,color="#293d52",fill="#0d1929",dash=false)=>shapes.push('<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="5" fill="'+fill+'" stroke="'+color+'"'+(dash?' stroke-dasharray="4 3"':"")+'/>');
 const text=(x,y,value,size=12,color="#dce5ee")=>shapes.push('<text x="'+x+'" y="'+y+'" fill="'+color+'" font-family="monospace" font-size="'+size+'">'+label(value)+'</text>');
 let y=90;const width=1280;
 text(24,30,"Arpkit Visualizer",22);text(24,54,m.model,14);text(24,74,"Full diagram • "+m.cpus.length+" threads • "+(m.inferred?"contains inferred grouping":"supplied CPU mapping"),11,"#a8b5c7");
 const sockets=[...m.sockets];const orphan=m.nodes.filter(n=>!n.cpus.length);
 if(orphan.length&&!sockets.some(s=>s.id===null))sockets.push({id:null,cpus:[],memoryOnly:true});
 for(const socket of sockets){
  const start=shapes.length,top=y;shapes.push("");text(40,y+25,"Socket "+(socket.id??"unknown"),15);y+=40;
  const ids=[...new Set(m.cpus.filter(c=>socket.cpus.includes(c.id)).map(c=>c.node))];
  if(socket.id===null)for(const n of orphan)if(!ids.includes(n.id))ids.push(n.id);
  for(const id of ids){
   const node=m.nodes.find(n=>n.id===id),nodeTop=y,nodeIndex=shapes.length;shapes.push("");
   const color=colors[(id??0)%8];text(56,y+24,"NUMA "+(id??"unknown"),14,color);text(250,y+24,"Memory: "+(node?.memory===null||!node?"unknown":(node.memory/1024**3).toFixed(1)+" GiB")+" · free "+(node?.free===null||!node?"unknown":(node.free/1024**3).toFixed(1)+" GiB"),11);
   y+=38;const cpus=m.cpus.filter(c=>socket.cpus.includes(c.id)&&c.node===id);
   const coreList=m.cores.filter(c=>c.cpus.some(cpu=>cpus.some(t=>t.id===cpu)));
   const groups=groupBy(coreList,c=>m.cpus.find(t=>t.id===c.cpus[0])?.L3);
   for(const [key,cores]of groups){
    const cache=m.caches.find(c=>c.key===key),groupTop=y,groupIndex=shapes.length;shapes.push("");
    text(70,y+20,(l3?"L3 "+(cache?"#"+cache.id+(cache.inferred?" (inferred)":""):"unknown"):"Core group")+" · "+cores.length+" cores",12,color);y+=30;
    const buckets=l2?groupBy(cores,c=>m.cpus.find(t=>t.id===c.cpus[0])?.L2):new Map([["hidden",cores]]);
    for(const [l2key,bucket]of buckets){
     const l2cache=m.caches.find(c=>c.key===l2key),l2Top=y,l2Index=shapes.length;shapes.push("");
     if(l2){text(82,y+17,"L2 "+(l2cache?"#"+l2cache.id+(l2cache.inferred?" (inferred)":""):"unknown"),10,"#a8b5c7");y+=25;}
     const cellHeight=l1?110:85;
     for(let i=0;i<bucket.length;i++){
      const core=bucket[i],x=84+(i%8)*139,cy=y+Math.floor(i/8)*cellHeight;
      rect(x,cy,130,cellHeight-8,color,"#080e19",core.inferred);text(x+7,cy+18,"Core "+(core.id??"?")+(core.inferred?" ~":""),10);
      if(l1)text(x+7,cy+33,"L1d / L1i "+(m.cpus.find(c=>c.id===core.cpus[0])?.L1d?"mapped":"unknown"),9,"#a8b5c7");
      const threadY=cy+(l1?45:30);
      core.cpus.forEach((cpu,j)=>{rect(x+6+(j%4)*29,threadY+Math.floor(j/4)*26,25,23,color,"#14283c");text(x+8+(j%4)*29,threadY+16+Math.floor(j/4)*26,cpu,9);});
     }
     y+=Math.ceil(bucket.length/8)*cellHeight+5;
     shapes[l2Index]='<rect x="76" y="'+l2Top+'" width="1130" height="'+(y-l2Top)+'" rx="4" fill="none" stroke="'+(l2?"#293d52":"none")+'"/>';y+=7;
    }
    shapes[groupIndex]='<rect x="64" y="'+groupTop+'" width="1154" height="'+(y-groupTop)+'" rx="4" fill="none" stroke="'+(l3?color:"#293d52")+'"'+(cache?.inferred?' stroke-dasharray="4 3"':"")+'/>';y+=12;
   }
   if(!coreList.length){text(70,y+15,"No CPU rows supplied for this node.",11,"#a8b5c7");y+=30;}
   shapes[nodeIndex]='<rect x="48" y="'+nodeTop+'" width="1184" height="'+(y-nodeTop)+'" rx="6" fill="none" stroke="'+color+'"/>';y+=16;
  }
  shapes[start]='<rect x="24" y="'+top+'" width="1232" height="'+(y-top)+'" rx="8" fill="none" stroke="#45596e"/>';y+=24;
 }
 const height=y+20;
 return {width,height,svg:'<svg xmlns="http://www.w3.org/2000/svg" width="'+width+'" height="'+height+'" viewBox="0 0 '+width+" "+height+'"><title>Arpkit machine topology</title><desc>'+escapeXML(m.model)+'. Full expanded topology. Inferred groups have dashed outlines. This is a diagram of pasted data.</desc><rect width="100%" height="100%" fill="#080e19"/>'+shapes.join("")+"</svg>"};
}
