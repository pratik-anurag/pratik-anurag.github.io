import { parseReport, diagnose, primary, recovery } from './analyze.js';
import { samples } from './samples.js';
const $ = id => document.getElementById(id);
let report = null, findings = [], timer, command = null;
function node(tag,text,className) { const el=document.createElement(tag); el.textContent=text; if(className) el.className=className; return el; }
for (const [key,sample] of Object.entries(samples)) $('preset').add(new Option(sample.name,key));
function svgNode(tag,attrs={},text) {
  const el=document.createElementNS('http://www.w3.org/2000/svg',tag);
  for(const [key,value] of Object.entries(attrs)) el.setAttribute(key,String(value));
  if(text!==undefined) el.textContent=text;
  return el;
}
function map() {
  const svg=svgNode('svg',{viewBox:'0 0 560 145',class:'socket-map',role:'img','aria-labelledby':'map-title'});
  const owner=primary(report);
  const label=owner ? `${report.port}/${report.proto} → ${owner.proc_name || 'unknown process'} (PID ${owner.pid || 'unknown'})${report.docker.mapped ? ' → Docker '+(report.docker.container_name || 'unknown container') : ''}` : 'No listener recorded in this snapshot.';
  svg.append(svgNode('title',{id:'map-title'},label));
  const box=(x,width,title,subtitle)=>{
    svg.append(svgNode('rect',{x,y:30,width,height:72,rx:6}),svgNode('text',{x:x+12,y:60},title.slice(0,26)),svgNode('text',{x:x+12,y:82,class:'caption'},subtitle.slice(0,30)));
  };
  box(2,145,`${report.port} / ${report.proto}`,owner ? 'snapshot listener' : 'no listener recorded');
  svg.append(svgNode('path',{d:'M147 66H190'}));
  box(190,175,owner?.proc_name || (owner ? 'Process unknown' : 'No owning process'),owner ? `PID ${owner.pid || '?'} · ${owner.local_ip}` : 'not a live availability check');
  if(report.docker.mapped) { svg.append(svgNode('path',{d:'M365 66H405'})); box(405,153,report.docker.container_name || 'Docker container',report.docker.container_port || 'container port unknown'); }
  $('map').replaceChildren(svg);
}
function commands() {
  command=null; $('copy-command').disabled=true;
  if(!report) { $('command').textContent='Load a valid snapshot first.'; $('command-note').textContent=''; return; }
  const result=recovery(report,$('action').value);
  $('command').textContent=result.allowed ? result.command : 'No command generated';
  $('command-note').textContent=result.allowed ? (['kill','restart'].includes($('action').value) ? 'This action can interrupt a service. Confirm the current process, ownership, and command in your terminal before proceeding.' : 'Run this yourself in a terminal with Portik installed.') : result.reason;
  if(result.allowed) { command=result.command; $('copy-command').disabled=false; }
}
function render() {
  $('port').textContent=`${report.port}/${report.proto}`; $('listeners').textContent=report.listeners.length; $('checks').textContent=findings.length;
  $('snapshot-meta').textContent=`${report.host?.hostname || 'Host unknown'} · ${report.host?.os || 'OS unknown'} · Captured: ${report.generated || 'time unknown'}`;
  map(); $('who').replaceChildren(); $('explain').replaceChildren();
  if(!report.listeners.length) $('who').append(node('p','No listeners recorded. This does not prove the port is free now.','empty'));
  for(const listener of report.listeners) {
    const article=node('article','','owner'); article.append(node('h3',listener.proc_name || 'Unknown process'));
    const dl=document.createElement('dl');
    for(const [key,value] of Object.entries({PID:listener.pid || 'Unknown',Bind:`${listener.local_ip || '*'}:${listener.local_port}`,Family:listener.family,State:listener.state,User:listener.user || 'Unknown',Command:listener.cmdline || 'Unavailable'})) dl.append(node('dt',key),node('dd',String(value)));
    article.append(dl); $('who').append(article);
  }
  if(report.docker.mapped) $('who').append(node('p',`Docker: ${report.docker.container_name || 'unknown'} · ${report.docker.container_port || 'unknown port'} · Compose service: ${report.docker.compose_service || 'unknown'}`,'notice'));
  if(!findings.length) $('explain').append(node('p','No supported snapshot checks produced a diagnostic. Environment checks are unavailable—not passed.','empty'));
  for(const finding of findings) {
    const article=node('article','','finding'), title=node('h3',finding.summary);
    title.append(node('span',finding.severity,`badge ${finding.severity==='warn' ? 'warn' : ''}`));
    article.append(title,node('p',finding.details),node('p',finding.action.replaceAll('<port>',String(report.port)))); $('explain').append(article);
  }
  $('copy-report').disabled=false; commands();
}
function invalidate() {
  report=null; findings=[]; command=null;
  for(const id of ['port','listeners','checks']) $(id).textContent='—';
  for(const id of ['who','explain','map']) $(id).replaceChildren();
  $('snapshot-meta').textContent=''; $('copy-command').disabled=true; $('copy-report').disabled=true; commands();
}
function analyze() {
  invalidate(); $('status').classList.remove('error');
  try { report=parseReport($('input').value); findings=diagnose(report); render(); $('status').textContent='Snapshot parsed locally. No machine inspection was performed.'; }
  catch(error) { $('status').textContent=error.message; $('status').classList.add('error'); $('who').append(node('p','Load a scenario or correct the JSON to inspect it.','empty')); }
}
function load() { clearTimeout(timer); $('input').value=JSON.stringify(samples[$('preset').value].report,null,2); $('input-mode').textContent='Synthetic scenario'; analyze(); }
$('input').addEventListener('input',()=>{clearTimeout(timer);invalidate();$('input-mode').textContent='Pasted / edited snapshot';$('status').textContent='Reading snapshot…';timer=setTimeout(analyze,300);});
$('load').addEventListener('click',load); $('clear').addEventListener('click',()=>{clearTimeout(timer);$('input').value='';$('input-mode').textContent='Your snapshot';analyze();$('input').focus();});
for(const button of document.querySelectorAll('[data-view]')) button.addEventListener('click',()=>{
  for(const other of document.querySelectorAll('[data-view]')) { const active=other===button;other.setAttribute('aria-pressed',String(active));$(other.dataset.view).hidden=!active; }
});
$('action').addEventListener('change',commands);
async function copy(text) { try { await navigator.clipboard.writeText(text); $('status').textContent='Copied. Nothing was executed.'; } catch { $('status').textContent='Clipboard unavailable. Select and copy the visible text manually.'; } }
$('copy-command').addEventListener('click',()=>{if(command) copy(command);});
$('copy-report').addEventListener('click',()=>{
  if(!report) return;
  const lines=[`Portik browser snapshot report — ${report.port}/${report.proto}`,'Not live inspection. Generated from supplied JSON.'];
  for(const l of report.listeners) lines.push(`${l.local_ip}:${l.local_port} ${l.state} PID=${l.pid || '?'} process=${l.proc_name || '?'} user=${l.user || '?'}`);
  for(const f of findings) lines.push(`[${f.severity}] ${f.summary}\n${f.details}\nNext: ${f.action.replaceAll('<port>',String(report.port))}`);
  lines.push('Unavailable: firewall, OS UID, live availability, VM/WSL/container environment.');copy(lines.join('\n\n'));
});
load();
