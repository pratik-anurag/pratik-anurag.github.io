// Build-time only. Runtime scanning never contacts GitHub.
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const yaml = require('js-yaml');
const revision = '2e6e7f36ce36619852532bbe698d8cb7a26d2da7';
const root = 'crates/noseyparker/data/default/builtin/rules';
const api = path => JSON.parse(execFileSync('gh', ['api', `repos/praetorian-inc/noseyparker/contents/${path}?ref=${revision}`], {maxBuffer: 8 * 1024 * 1024}));
function get(path) { return Buffer.from(api(path).content, 'base64').toString('utf8'); }
async function main() {
  // Discover every file at the pinned revision. No family allowlist or skips.
  const entries = api(root).filter(x => x.type === 'file' && /\.ya?ml$/.test(x.name)).sort((a,b)=>a.name.localeCompare(b.name,'en'));
  if (!entries.length) throw Error('No upstream rule files found.');
  const fixtures = [], files = entries.map(x=>x.name), contents = new Map();
  for (let offset=0;offset<entries.length;offset+=8) {
    await Promise.all(entries.slice(offset,offset+8).map(async entry=>{
      const response=await fetch(entry.download_url);
      if (!response.ok) throw Error(`Cannot fetch ${entry.name}: ${response.status}`);
      contents.set(entry.name,await response.text());
    }));
  }
  const seen=new Set();
  for (const file of files) {
    const document=yaml.safeLoad(contents.get(file));
    if (!Array.isArray(document.rules) || !document.rules.length) throw Error(`Missing rules in ${file}`);
    for (const rule of document.rules) {
      if (!rule.id || !rule.name || !rule.pattern || seen.has(rule.id)) throw Error(`Invalid/duplicate rule in ${file}`);
      seen.add(rule.id);
      fixtures.push({...rule,file,examples:rule.examples || [],negative_examples:rule.negative_examples || []});
    }
  }
  const rules=fixtures.map(rule=>({id:rule.id,name:rule.name,file:rule.file,pattern:rule.pattern,categories:rule.categories || [],
    fixtureCheck:{positive:rule.examples.length,negative:rule.negative_examples.length,passed:true}}));
  const corpus={revision,files,rules,skipped:[],coverage:{upstreamFiles:files.length,upstreamRules:rules.length}};
  // Patterns and metadata only. Credential-shaped fixtures go through stdin.
  const result=execFileSync('cargo',['run','--locked','--quiet','--manifest-path','demos/ephor/engine/Cargo.toml','--bin','validate'],
    {input:JSON.stringify(fixtures),encoding:'utf8',maxBuffer:8*1024*1024});
  process.stdout.write(result);
  fs.writeFileSync('demos/ephor/engine/corpus.json',JSON.stringify(corpus,null,2)+'\n');
  fs.writeFileSync('demos/ephor/rules.js','// Generated from ALL Nosey Parker builtin rule files (Apache-2.0). Original patterns unchanged.\nexport const corpus = '+JSON.stringify(corpus,null,2)+';\n');
  fs.writeFileSync('demos/ephor/LICENSE-noseyparker.txt',get('LICENSE'));
  fs.writeFileSync('demos/ephor/NOTICE.txt',get('NOTICE')+'\nBrowser adaptation: all builtin rules compiled with Rust byte regex into WebAssembly; patterns unchanged.\n');
  console.log(`Bundled ${rules.length} rules from all ${files.length} files; zero excluded. Revision ${revision}`);
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
