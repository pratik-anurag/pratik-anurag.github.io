const fs = require('node:fs');
for (const name of ['ephor','portik']) {
  const target=`public/projects/${name}/demo`;
  fs.mkdirSync(target,{recursive:true});
  for (const file of fs.readdirSync(`demos/${name}`)) {
    if (!/\.(js|html|txt|wasm)$/.test(file)) continue;
    fs.copyFileSync(`demos/${name}/${file}`,`${target}/${file}`);
  }
  fs.copyFileSync('demos/shared/styles.css',`${target}/styles.css`);
  console.log(`Copied ${name} browser demo to ${target}`);
}
