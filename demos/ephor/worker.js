import { scan } from './scan.js';
self.onmessage = ({data}) => {
  try { self.postMessage({id:data.id, result:scan(data.text)}); }
  catch (error) { self.postMessage({id:data.id, error:error.message}); }
};
