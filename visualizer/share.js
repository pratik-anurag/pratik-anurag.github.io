import {MAX_BYTES}from "./parser.js";
const MAX_HASH=131072;
const encoder=new TextEncoder(),decoder=new TextDecoder("utf-8",{fatal:true});
function base64(bytes){let binary="";for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(binary);}
function unbase64(raw){return Uint8Array.from(atob(raw.replace(/ /g,"+")),c=>c.charCodeAt(0));}
export async function encodeShare(text){
 const bytes=encoder.encode(text);if(bytes.length>MAX_BYTES)throw new Error("Input exceeds 1 MiB.");
 let data=bytes,field="t";if(typeof CompressionStream!=="undefined"){data=new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer());field="z";}
 const hash="#"+new URLSearchParams({v:"1",[field]:base64(data)});
 if(hash.length>MAX_HASH)throw new Error("Capture is too large for a share link (128 KiB limit). Download the diagram instead.");
 return hash;
}
export async function decodeShare(hash){
 if(hash.length>MAX_HASH)throw new Error("Share link exceeds 128 KiB.");
 const p=new URLSearchParams(hash.replace(/^#/,""));if(p.get("v")!=="1"||(!p.has("t")&&!p.has("z")))throw new Error("Unsupported share format.");
 let data=unbase64(p.get("z")??p.get("t"));
 if(p.has("z")){
  if(typeof DecompressionStream==="undefined")throw new Error("This browser cannot decompress the share link.");
  const reader=new Blob([data]).stream().pipeThrough(new DecompressionStream("gzip")).getReader();const chunks=[];let total=0;
  try{while(true){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>MAX_BYTES){await reader.cancel();throw new Error("Decompressed capture exceeds 1 MiB.");}chunks.push(value);}}
  finally{reader.releaseLock();}
  data=new Uint8Array(total);let offset=0;for(const chunk of chunks){data.set(chunk,offset);offset+=chunk.length;}
 }
 if(data.length>MAX_BYTES)throw new Error("Capture exceeds 1 MiB.");return decoder.decode(data);
}
