"use strict";
async function init() {
 const go = new Go();
 const bytes = await fetch("esplain.wasm");
 if (!bytes.ok) throw new Error("Could not load esplain.wasm");
 const {instance} = await WebAssembly.instantiate(await bytes.arrayBuffer(),go.importObject);
 go.run(instance);
 document.querySelector("#status").textContent="Ready. Analysis runs locally.";
 const analyze = () => { const data=JSON.parse(explainQuery(document.querySelector("#query").value)); document.querySelector("#result").textContent=data.error||data.report; };
 document.querySelector("#query").addEventListener("input",analyze); analyze();
}
init().catch(error => { document.querySelector("#status").textContent=error.message; });
