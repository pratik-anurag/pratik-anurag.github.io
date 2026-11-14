import { corpus } from './rules.js';
import { MAX_BYTES } from './scan.js';
import { samples } from './samples.js';
const $ = id => document.getElementById(id);
let worker, timer, deadline, sequence = 0, current = null;
const sourceURL = file => `https://github.com/praetorian-inc/noseyparker/blob/${corpus.revision}/crates/noseyparker/data/default/builtin/rules/${file}`;
function element(tag, text, className) {
  const node = document.createElement(tag); node.textContent = text;
  if (className) node.className = className;
  return node;
}
for (const [key, sample] of Object.entries(samples)) $('preset').add(new Option(sample.name, key));
$('rules').textContent = corpus.rules.length;
$('coverage-title').textContent = `Rule coverage · ${corpus.rules.length} included, ${corpus.skipped.length} excluded`;
for (const rule of corpus.rules) {
  const row = element('div', '', 'rule-row');
  row.append(element('span', rule.name));
  const link = element('a', rule.id); link.href = sourceURL(rule.file); row.append(link); $('coverage').append(row);
}
$('coverage-note').textContent = `Pinned revision ${corpus.revision.slice(0,7)}. Selected families: ${corpus.files.join(', ')}. Excluded due to unsupported scoped regex flags: ${corpus.skipped.map(x=>x.name).join('; ')}. No other upstream families are bundled.`;
$('upstream').href = `https://github.com/praetorian-inc/noseyparker/tree/${corpus.revision}/crates/noseyparker/data/default/builtin/rules`;
function cancel() {
  sequence++; clearTimeout(timer); clearTimeout(deadline);
  if (worker) worker.terminate(); worker = null; current = null;
  $('simulate').disabled = true; $('copy').disabled = true;
  $('findings').replaceChildren(); $('redacted').textContent = '';
  $('matches').textContent = '—';
}
function error(message) {
  $('status').textContent = message; $('status').classList.add('error');
  $('scan-state').textContent = 'Not scanned';
  $('results').setAttribute('aria-busy', 'false');
  $('summary').textContent = 'Scan incomplete. No safety conclusion can be drawn.';
}
function render(result) {
  current = result;
  $('results').setAttribute('aria-busy', 'false');
  $('matches').textContent = result.findings.length + (result.truncated ? '+' : '');
  $('scan-state').textContent = result.findings.length ? 'Review matches' : 'No matches';
  $('status').textContent = result.truncated ? 'Stopped after 500 matches. Use a smaller excerpt; redaction is unavailable.' : 'Scan complete. Text stays in this tab.';
  $('simulate').disabled = result.truncated;
  $('copy').disabled = result.redacted === null;
  $('summary').textContent = result.findings.length
    ? `First matching rule: ${result.findings[0].name}. Ephor’s native warning uses the first matching rule; this report includes additional matches.`
    : 'No bundled rule matched. This is not a guarantee that the text contains no sensitive information.';
  const fragment = document.createDocumentFragment();
  for (const finding of result.findings) {
    const row = element('article', '', 'finding');
    const title = element('h3', finding.name);
    title.append(element('span', finding.kind === 'secret' ? 'secret pattern' : 'identifier pattern', `badge ${finding.kind === 'secret' ? 'risk' : 'warn'}`));
    row.append(title, element('p', `Line ${finding.line}, column ${finding.column} · matched value hidden`));
    const link = element('a', `Inspect ${finding.id} ↗`, 'tiny'); link.href = sourceURL(finding.file); row.append(link); fragment.append(row);
  }
  $('findings').replaceChildren(fragment);
  $('redacted').textContent = result.redacted ?? 'Unavailable: scan stopped early. Shorten the input and scan again.';
}
function schedule() {
  cancel(); $('status').classList.remove('error');
  const text = $('input').value, bytes = new TextEncoder().encode(text).length;
  $('size').textContent = bytes.toLocaleString();
  if (!text) {
    $('status').textContent = 'Paste text or load a synthetic example.';
    $('scan-state').textContent = 'Waiting'; $('summary').textContent = 'No input to scan.';
    $('results').setAttribute('aria-busy', 'false'); return;
  }
  if (bytes > MAX_BYTES) { error('Input exceeds 256 KiB. Scan a smaller excerpt.'); return; }
  $('scan-state').textContent = 'Scanning'; $('status').textContent = 'Scanning locally…';
  $('summary').textContent = 'Waiting for the local scanner…'; $('results').setAttribute('aria-busy', 'true');
  const id = sequence;
  timer = setTimeout(() => {
    try {
      worker = new Worker(new URL('./worker.js', import.meta.url), {type:'module'});
      worker.onmessage = ({data}) => {
        if (data.id !== sequence) return;
        clearTimeout(deadline); worker.terminate(); worker = null;
        if (data.error) error(data.error); else render(data.result);
      };
      worker.onerror = () => { if (id !== sequence) return; clearTimeout(deadline); worker?.terminate(); worker=null; error('Scanner could not start. Use a current browser and serve this page over HTTP(S).'); };
      deadline = setTimeout(() => { if (id !== sequence) return; worker?.terminate(); worker=null; error('Scan exceeded 2 seconds. Reduce the input and try again.'); }, 2000);
      worker.postMessage({id, text});
    } catch { error('Web Workers are unavailable. Open this demo over HTTP(S) in a current browser.'); }
  }, 300);
}
function load() { $('input').value = samples[$('preset').value].text; schedule(); }
function clear() { $('input').value = ''; schedule(); $('input').focus(); }
$('input').addEventListener('input', schedule);
$('load').addEventListener('click', load); $('clear').addEventListener('click', clear);
$('simulate').addEventListener('click', () => {
  if (!current) return;
  if (!current.findings.length) { $('status').textContent = 'Demo: no bundled pattern matched, so no warning would be shown. This does not certify safety.'; return; }
  if ($('destination').value === 'Terminal') { $('status').textContent = 'Demo: a pattern matched, but Terminal is not in Ephor’s recognized browser list. No browser warning.'; return; }
  $('warning-detail').textContent = `Simulated destination: ${$('destination').value}. First rule: ${current.findings[0].name}.`;
  $('warning').showModal();
});
$('warning-close').addEventListener('click', () => $('warning').close());
$('warning-clear').addEventListener('click', () => { $('warning').close(); clear(); });
$('copy').addEventListener('click', async () => {
  if (!current || current.redacted === null) return;
  try { await navigator.clipboard.writeText(current.redacted); $('status').textContent = 'Redacted text copied. Review for unmatched secrets before sharing.'; }
  catch { $('status').textContent = 'Clipboard permission unavailable. Select and copy the redacted preview manually.'; }
});
load();
