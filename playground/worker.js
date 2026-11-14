"use strict";
importScripts("wasm_exec.js");
const initialized = (async () => {
 const go = new Go();
 const response = await fetch("esplain.wasm");
 if (!response.ok) throw new Error("Could not load the Go engine. Reload to retry.");
 const {instance} = await WebAssembly.instantiate(await response.arrayBuffer(),go.importObject);
 go.run(instance).catch(error => postMessage({type:"fatal",error:error.message}));
 postMessage({type:"ready"});
})();
initialized.catch(error => postMessage({type:"fatal",error:error.message}));
onmessage = async ({data}) => {
 try {
  await initialized;
  const result = JSON.parse(explainQuery(data.query,data.response || ""));
  postMessage({type:"result",id:data.id,result});
 } catch (error) { postMessage({type:"result",id:data.id,result:{error:error.message}}); }
};
