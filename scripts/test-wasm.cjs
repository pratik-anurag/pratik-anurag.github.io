const fs = require("node:fs");
globalThis.crypto ||= require("node:crypto").webcrypto;
require("../playground/wasm_exec.js");
(async () => {
 const go = new Go();
 const {instance} = await WebAssembly.instantiate(fs.readFileSync("playground/esplain.wasm"),go.importObject);
 go.run(instance);
 const result=JSON.parse(globalThis.explainQuery('{"size":10,"query":{"match":{"name":"running shoes"}}}'));
 if (result.error || !result.report.includes("Natural Language Breakdown") || result.tree.Name !== "root") throw new Error("Wasm bridge failed");
 console.log("Go Wasm bridge: sample query passed");
 process.exit(0);
})().catch(error => { console.error(error); process.exit(1); });
