const listener = (port, ip='127.0.0.1', name='node', pid=4217, user='developer', family='ipv4') => ({local_ip:ip,local_port:port,family,state:'LISTEN',pid,proc_name:name,cmdline:name==='node' ? 'node server.js' : name,user});
const report = (port,listeners,extra={}) => ({port,proto:'tcp',generated:'2026-11-01T09:00:00Z',host:{os:'linux',arch:'amd64',hostname:'demo-workstation'},user:{username:'developer'},listeners,connections:[],docker:{checked:false,mapped:false},diagnostics:[],...extra});
export const samples = {
  busy:{name:'3000 · Local dev server',report:report(3000,[listener(3000)])},
  docker:{name:'5432 · Docker database',report:report(5432,[listener(5432,'0.0.0.0','docker-proxy',904,'root')],{docker:{checked:true,mapped:true,container_id:'demo-db',container_name:'shop-postgres',compose_service:'database',container_port:'5432/tcp'}})},
  ipv6:{name:'8080 · IPv6-only listener',report:report(8080,[listener(8080,'::','go-api',6201,'developer','ipv6')])},
  waits:{name:'9000 · TIME_WAIT after restart',report:report(9000,[],{connections:[{local_ip:'127.0.0.1',local_port:9000,remote_ip:'127.0.0.1',remote_port:50123,family:'ipv4',state:'TIME_WAIT'}]})},
  hidden:{name:'80 · Missing process permissions',report:report(80,[{local_ip:'0.0.0.0',local_port:80,family:'ipv4',state:'LISTEN'}])},
  shared:{name:'8000 · Multiple worker processes',report:report(8000,[listener(8000,'127.0.0.1','gunicorn',8101),listener(8000,'127.0.0.1','gunicorn',8102)])}
};
