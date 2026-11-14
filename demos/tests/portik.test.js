import test from 'node:test';
import assert from 'node:assert/strict';
import { samples } from '../portik/samples.js';
import { parseReport, diagnose, recovery, MAX_BYTES } from '../portik/analyze.js';
const parse = value => parseReport(JSON.stringify(value));
const clone = value => structuredClone(value);
for(const [key,sample] of Object.entries(samples)) test(`Portik scenario: ${key}`,()=>{
  const report=parse(sample.report);
  assert.ok(Number.isInteger(report.port)); assert.ok(Array.isArray(diagnose(report)));
});
test('busy loopback server follows native deterministic checks',()=>{
  assert.deepEqual(diagnose(parse(samples.busy.report)).map(f=>f.kind),['in-use','loopback-only']);
});
test('Docker mapping retained; host process ownership blocks disruptive preview',()=>{
  const report=parse(samples.docker.report);
  assert.ok(diagnose(report).some(f=>f.kind==='docker'));
  assert.ok(diagnose(report).find(f=>f.kind==='docker').action.includes('restart --docker --container <port>'));
  assert.equal(recovery(report,'restart').allowed,false);
  assert.equal(recovery(report,'who').command,'portik who --docker 5432');
});
test('TIME_WAIT with no listeners is not an owning process',()=>{
  const report=parse(samples.waits.report);
  assert.deepEqual(diagnose(report).map(f=>f.kind),['time-wait']);
  assert.equal(recovery(report,'kill').allowed,false);
});
test('IPv6 heuristic and multiple-PID checks',()=>{
  assert.ok(diagnose(parse(samples.ipv6.report)).some(f=>f.kind==='ipv6-only'));
  assert.ok(diagnose(parse(samples.shared.report)).some(f=>f.kind==='multi-listener'));
  const report=clone(samples.shared.report);report.listeners[1].pid=report.listeners[0].pid;
  assert.ok(!diagnose(parse(report)).some(f=>f.kind==='multi-listener'));
});
test('missing PID and privileged port hints, without fabricating host context',()=>{
  const findings=diagnose(parse(samples.hidden.report));
  assert.deepEqual(findings.map(f=>f.kind),['permission','pid-missing']);
  assert.ok(!findings.some(f=>['firewall','env','vm'].includes(f.kind)));
});
test('zombies, absent ownership and differing users cannot generate kill/restart',()=>{
  for(const edit of [r=>r.listeners[0].is_zombie=true,r=>delete r.listeners[0].user,r=>r.listeners[0].user='root',r=>delete r.user]) {
    const report=clone(samples.busy.report);edit(report);
    for(const action of ['kill','restart']) assert.equal(recovery(parse(report),action).allowed,false);
  }
});
test('command flags precede port, and user-controlled strings are never shell interpolated',()=>{
  const report=clone(samples.busy.report);report.proto='udp';report.listeners[0].cmdline='$(touch /tmp/not-run)';
  assert.equal(recovery(parse(report),'kill').command,'portik kill --proto udp 3000');
  assert.throws(()=>recovery(parse(report),'shell'),/Unsupported/);
});
test('malformed and oversized reports are rejected clearly',()=>{
  for(const text of ['', '{', 'null', '[]', 'true', '"text"']) assert.throws(()=>parseReport(text));
  assert.throws(()=>parseReport('x'.repeat(MAX_BYTES+1)),/256 KiB/);
  for(const edit of [r=>r.port=70000,r=>r.port='3000',r=>r.listeners={},r=>r.listeners=[null],r=>r.listeners[0].pid=-1,r=>r.listeners[0].local_ip={},r=>r.listeners[0].local_port=4000,r=>r.docker.mapped='true',r=>r.connections=[null],r=>r.user='bad',r=>r.listeners[0].state='INVALID']) {
    const report=clone(samples.busy.report);edit(report);assert.throws(()=>parse(report));
  }
});
test('native null slices normalize and root does not get non-root hint',()=>{
  const report=clone(samples.hidden.report);report.listeners=null;report.connections=null;report.user.username='root';
  assert.deepEqual(diagnose(parse(report)),[]);
});
