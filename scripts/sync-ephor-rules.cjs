// Build-time only. Runtime scanning never contacts GitHub.
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const yaml = require('js-yaml');
const revision = '2e6e7f36ce36619852532bbe698d8cb7a26d2da7';
const files = ['aws', 'github', 'gitlab', 'slack', 'stripe', 'npm', 'openai', 'pem', 'google'];
const root = 'crates/noseyparker/data/default/builtin/rules';
function get(path) {
  const data = JSON.parse(execFileSync('gh', ['api', `repos/praetorian-inc/noseyparker/contents/${path}?ref=${revision}`], {maxBuffer: 8 * 1024 * 1024}));
  return Buffer.from(data.content, 'base64').toString('utf8');
}
function translate(pattern) {
  let flags = 'gd', extended = false;
  pattern = pattern.replace(/^(?:\s*\(\?[ixms]+\))+/, prefix => {
    extended = prefix.includes('x');
    for (const f of ['i', 'm', 's']) if (prefix.includes(f)) flags += f;
    return '';
  });
  let source = '', inClass = false;
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i];
    if (c === '\\') { source += c + (pattern[++i] || ''); continue; }
    if (!inClass && pattern.startsWith('(?#', i)) {
      const end = pattern.indexOf(')', i + 3);
      if (end < 0) throw Error('Unclosed comment');
      i = end; continue;
    }
    if (c === '[') inClass = true;
    if (c === ']') inClass = false;
    if (extended && !inClass && /\s/.test(c)) continue;
    if (extended && !inClass && c === '#') {
      while (i < pattern.length && pattern[i] !== '\n') i++;
      continue;
    }
    source += c;
  }
  // Reject non-ECMAScript syntax rather than silently broadening a rule.
  if (/\(\?[ixms-]|\\[Az]|\[\[:|\\p\{/.test(source)) throw Error('Unsupported regex syntax');
  new RegExp(source, flags);
  return {source, flags};
}
const rules = [], skipped = [];
for (const file of files) {
  for (const rule of yaml.safeLoad(get(`${root}/${file}.yml`)).rules) {
    try {
      const translated = translate(rule.pattern);
      // Require parity on every supplied upstream positive and negative fixture.
      for (const example of rule.examples || []) {
        if (!new RegExp(translated.source, translated.flags).test(example)) throw Error('Positive fixture differs');
      }
      for (const example of rule.negative_examples || []) {
        if (new RegExp(translated.source, translated.flags).test(example)) throw Error('Negative fixture differs');
      }
      // Upstream fixtures can contain credential-shaped strings. Validate them
      // here, but never distribute their values in a public static bundle.
      rules.push({id: rule.id, name: rule.name, file: `${file}.yml`, categories: rule.categories || [],
        pattern: rule.pattern, ...translated,
        fixtureCheck: {positive: (rule.examples || []).length, negative: (rule.negative_examples || []).length, passed: true}});
    } catch (e) { skipped.push({id: rule.id, name: rule.name, reason: e.message}); }
  }
}
fs.mkdirSync('demos/ephor', {recursive: true});
fs.writeFileSync('demos/ephor/rules.js', '// Generated from Nosey Parker (Apache-2.0). Modified: regex syntax translated for ECMAScript.\n' +
  'export const corpus = ' + JSON.stringify({revision, files, rules, skipped}, null, 2) + ';\n');
fs.writeFileSync('demos/ephor/LICENSE-noseyparker.txt', get('LICENSE'));
fs.writeFileSync('demos/ephor/NOTICE.txt', get('NOTICE') + '\nBrowser adaptation: selected rules translated to ECMAScript; see rules.js and README.\n');
console.log(`Bundled ${rules.length} rules; ${skipped.length} excluded. Revision ${revision}`);
console.log(skipped);
