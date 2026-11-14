// Build-time attribution for the native crates compiled into the Wasm engine.
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const metadata = JSON.parse(execFileSync('cargo',['metadata','--locked','--format-version','1','--manifest-path','demos/ephor/engine/Cargo.toml'],{encoding:'utf8'}));
let output = 'Ephor WebAssembly engine — Rust dependency license notices\n';
for (const pkg of metadata.packages.filter(p=>p.source).sort((a,b)=>a.name.localeCompare(b.name))) {
  const directory = path.dirname(pkg.manifest_path);
  const files = fs.readdirSync(directory).filter(name=>/^(license|copying|unlicense|notice)/i.test(name) && fs.statSync(path.join(directory,name)).isFile());
  if (!files.length) throw Error(`No dependency license text found for ${pkg.name}`);
  output += `\n\n=== ${pkg.name} ${pkg.version} (${pkg.license}) ===\n`;
  for (const file of files) output += `\n--- ${file} ---\n` + fs.readFileSync(path.join(directory,file),'utf8');
}
fs.writeFileSync('demos/ephor/LICENSE-engine.txt',output);
