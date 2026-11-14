// Browser port of pure branches in Portik internal/inspect/diagnose.go.
// Source revision c54972d2cf18bc93c02f8becb5f6bcf8f3b88bef (MIT).
export const MAX_BYTES = 256 * 1024;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
function string(value, key, optional = true) {
  if (value === undefined && optional) return;
  if (typeof value !== 'string' || value.length > 8192) throw Error(`${key} must be a string of at most 8192 characters.`);
}
function port(value, key) {
  if (!Number.isInteger(value) || value < 1 || value > 65535) throw Error(`${key} must be an integer from 1 to 65535.`);
}
export function parseReport(text) {
  if (new TextEncoder().encode(text).length > MAX_BYTES) throw Error('Snapshot exceeds 256 KiB. Use a smaller report.');
  if (!text.trim()) throw Error('Paste a portik who/explain --json report or load a scenario.');
  let report;
  try { report = JSON.parse(text); } catch { throw Error('Invalid JSON. Check commas, quotes, and brackets in the snapshot.'); }
  if (!object(report)) throw Error('Expected a Portik JSON report object, not a list.');
  port(report.port, 'port');
  if (!['tcp','udp'].includes(report.proto)) throw Error('proto must be "tcp" or "udp".');
  if (report.listeners === null) report.listeners = [];
  if (!Array.isArray(report.listeners) || report.listeners.length > 500) throw Error('listeners must be an array with at most 500 entries (or null).');
  for (const [i, listener] of report.listeners.entries()) {
    if (!object(listener)) throw Error(`listeners[${i}] must be an object.`);
    for (const key of ['local_ip','family','state']) string(listener[key], `listeners[${i}].${key}`, false);
    if (!['ipv4','ipv6','unknown'].includes(listener.family)) throw Error('Listener family must be ipv4, ipv6, or unknown.');
    if (!['LISTEN','BOUND'].includes(listener.state)) throw Error('Listener state must be LISTEN or BOUND.');
    port(listener.local_port, 'local_port');
    if (listener.local_port !== report.port) throw Error('Listener local_port must match report.port.');
    if (listener.pid !== undefined && (!Number.isInteger(listener.pid) || listener.pid < 0 || listener.pid > 2147483647)) throw Error('pid must be a non-negative 32-bit integer.');
    for (const key of ['proc_name','cmdline','working_dir','user']) string(listener[key], key);
    if (listener.is_zombie !== undefined && typeof listener.is_zombie !== 'boolean') throw Error('is_zombie must be true or false.');
  }
  if (report.connections == null) report.connections = [];
  if (!Array.isArray(report.connections) || report.connections.length > 2000) throw Error('connections must be an array with at most 2000 entries.');
  for (const connection of report.connections) {
    if (!object(connection)) throw Error('Each connection must be an object.');
    string(connection.state, 'connection.state', false); port(connection.local_port, 'connection.local_port');
  }
  if (report.docker == null) report.docker = {checked:false, mapped:false};
  if (!object(report.docker)) throw Error('docker must be an object.');
  for (const key of ['checked','mapped']) if (report.docker[key] !== undefined && typeof report.docker[key] !== 'boolean') throw Error(`docker.${key} must be true or false.`);
  for (const key of ['container_id','container_name','compose_service','container_port']) string(report.docker[key], `docker.${key}`);
  for (const key of ['host','user']) if (report[key] !== undefined && !object(report[key])) throw Error(`${key} must be an object.`);
  for (const key of ['os','arch','hostname','kernel']) string(report.host?.[key], `host.${key}`);
  string(report.user?.username, 'user.username');
  string(report.generated, 'generated');
  return report;
}
export const primary = report => report.listeners.find(listener => listener.pid > 0) || report.listeners[0];
const loopback = ip => ip === '::1' || ip === '127.0.0.1' || ip.startsWith('127.');
export function diagnose(report) {
  const findings = [];
  const add = (kind, severity, summary, details, action) => findings.push({kind,severity,summary,details,action});
  const listener = primary(report), listeners = report.listeners;
  // Native code checks current OS UID. Only infer from a supplied snapshot username here.
  if (report.port < 1024 && report.user?.username && !['root','0'].includes(report.user.username))
    add('permission','info','Privileged port may require admin/root', `Port ${report.port} is < 1024. On many systems binding requires root/admin privileges.`, 'Try running with sudo or choose a higher port.');
  if (listener?.pid > 0 && listener.state === 'LISTEN')
    add('in-use','info','Port is in use', `pid ${listener.pid} (${listener.proc_name || 'unknown'}) is listening on ${report.port}/${report.proto}`, 'Stop it: portik kill <port>  |  Restart it: portik restart <port>');
  if (listeners.length && !listeners.some(l=>l.pid > 0))
    add('pid-missing','warn','Process details unavailable','Port has listeners but no owning PID/cmdline was found. This can happen without elevated privileges.','Re-run with sudo/admin, or check OS-specific permissions.');
  if (new Set(listeners.filter(l=>l.pid>0).map(l=>l.pid)).size > 1)
    add('multi-listener','info','Multiple processes are listening on the same port','More than one PID owns listeners for this port. This is common with SO_REUSEPORT or multiple instances.','Check if multiple instances were started, or if the service is configured to share the port.');
  if (report.proto === 'tcp' && listeners.some(l=>l.family==='ipv6') && !listeners.some(l=>l.family==='ipv4'))
    add('ipv6-only','warn','Only IPv6 listener detected (IPv4 bind confusion)','A process is listening on IPv6 only. Binding on 0.0.0.0:<port> may fail or appear unreachable from IPv4.','Bind to [::] or enable dual-stack, or ensure the app listens on IPv4 too.');
  if (listeners.length && listeners.every(l=>loopback(l.local_ip)))
    add('loopback-only','info','Service is bound to loopback only','The listener is bound to 127.0.0.1 or ::1. It will not accept connections from other hosts.','Bind to 0.0.0.0 or [::] if you need external access.');
  const waits = report.connections.filter(c=>c.state==='TIME_WAIT' && c.local_port===report.port).length;
  if (waits) add('time-wait','info','TIME_WAIT sockets present',`Found ${waits} TIME_WAIT connections involving local port ${report.port}. Rapid restarts can cause transient address-in-use errors.`,'Wait a few seconds and retry, or ensure the service uses SO_REUSEADDR where appropriate.');
  const zombie = listeners.find(l=>l.is_zombie);
  if (zombie) add('zombie','warn','Zombie process detected owning the port',`pid ${zombie.pid || 'unknown'} (${zombie.proc_name || 'unknown'}) appears to be a zombie. Parent process must reap it.`,'Restart the parent process, or reboot if the zombie cannot be reaped.');
  if (report.docker.mapped)
    add('docker','info','Port is mapped from a Docker container',`Host port ${report.port}/${report.proto} is mapped to ${report.docker.container_id || 'unknown'} (${report.docker.container_name || 'unknown'}) service=${report.docker.compose_service || 'unknown'} containerPort=${report.docker.container_port || 'unknown'}`,'Inspect first: portik who --docker <port>. For an intentional container restart, use portik restart --docker --container <port>.');
  return findings;
}
export function recovery(report, action = 'explain') {
  if (!['who','explain','kill','restart'].includes(action)) throw Error('Unsupported command.');
  const listener = primary(report);
  if (['kill','restart'].includes(action)) {
    if (!listener?.pid) return {allowed:false, reason:'No owning PID in this snapshot. Inspect permissions before taking action.'};
    if (!listener.user || !report.user?.username) return {allowed:false,reason:'Process ownership is unknown. Confirm the owner on your machine first.'};
    if (listener.user !== report.user.username) return {allowed:false,reason:'The owner differs from the snapshot user. No force command is generated.'};
    if (listener.is_zombie) return {allowed:false,reason:'A zombie must be reaped by its parent. Killing this PID is not a recovery plan.'};
  }
  return {allowed:true, command:`portik ${action}${report.proto === 'udp' ? ' --proto udp' : ''}${report.docker.mapped ? ' --docker' : ''} ${report.port}`};
}
