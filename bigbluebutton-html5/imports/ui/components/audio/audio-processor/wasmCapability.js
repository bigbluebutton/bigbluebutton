// check if wasm processor is supported, assigned to undefined if not checked yet
let wasmProcessorUnsupportedError;

const isGenericWasmProcessingSupported = () => {
  if (typeof wasmProcessorUnsupportedError !== 'undefined') {
    return !wasmProcessorUnsupportedError;
  }

  if (typeof AudioContext === 'undefined') {
    wasmProcessorUnsupportedError = 'AudioContext unsupported';
    return false;
  }
  if (typeof WebAssembly === 'undefined') {
    wasmProcessorUnsupportedError = 'WebAssembly unsupported';
    return false;
  }
  // eslint-disable-next-line max-len
  if (!WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 2, 8, 1, 1, 97, 1, 98, 3, 127, 1, 6, 6, 1, 127, 1, 65, 0, 11, 7, 5, 1, 1, 97, 3, 1]))) {
    wasmProcessorUnsupportedError = 'Importable/Exportable mutable globals unsupported';
    return false;
  }

  wasmProcessorUnsupportedError = '';
  return true;
};

export {
  isGenericWasmProcessingSupported,
};
