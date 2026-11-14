import { scan, initScanner } from './scan.js';
import { corpus } from './rules.js';
const ready = initScanner();
self.onmessage = async ({data}) => {
  try {
    const count = await ready;
    if (count !== corpus.rules.length) throw Error('Scanner assets are out of sync. Reload the page before scanning.');
    self.postMessage({id:data.id, state:'ready'});
    self.postMessage({id:data.id, result:scan(data.text)});
  }
  catch (error) { self.postMessage({id:data.id, error:error.message}); }
};
