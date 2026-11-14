export const MAX_BYTES = 256 * 1024;
let engine;
export async function initScanner(bytes) {
  if (engine) return engine.rule_count();
  if (!bytes) {
    // Only the static wasm asset is fetched. Input is never sent.
    const response = await fetch(new URL('./engine.wasm', import.meta.url), {credentials:'omit'});
    if (!response.ok) throw Error('Could not load the local scanner asset.');
    bytes = await response.arrayBuffer();
  }
  const {instance} = await WebAssembly.instantiate(bytes);
  engine = instance.exports;
  return engine.rule_count(); // Compile every rule before accepting input.
}
export function scan(text) {
  if (typeof text !== 'string') throw Error('Paste plain text to scan.');
  const bytes = new TextEncoder().encode(text);
  if (bytes.length > MAX_BYTES) throw Error('Input exceeds 256 KiB. Scan a smaller excerpt.');
  if (!engine) throw Error('Scanner is still initializing.');
  const pointer = engine.alloc(bytes.length);
  try {
    new Uint8Array(engine.memory.buffer, pointer, bytes.length).set(bytes);
    const output = engine.scan(pointer, bytes.length);
    const result = JSON.parse(new TextDecoder().decode(new Uint8Array(engine.memory.buffer, output, engine.result_len())));
    if (result.error) throw Error(result.error);
    return result;
  } finally { engine.dealloc(pointer, bytes.length); }
}
