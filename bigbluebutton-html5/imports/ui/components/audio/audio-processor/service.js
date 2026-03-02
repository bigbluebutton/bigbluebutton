// files loaded during loadWasmProcessorFiles
const loadedFiles = {
  // store first caught error
  error: null,
  // BBBA-mapi.wasm
  wasmBlob: null,
  // BBBA-mapi.js
  wasmJS: null,
  // mapi-proc.js
  worklet: null,
};

// global audio processor so we can communicate with it
let audioProcessor = null;

// check if wasm processor is supported, assigned to undefined if not checked yet
let wasmProcessorUnsupportedError;

// create an audio processor on top of a stream, trigger Promise resolve with a processed stream
const createWasmProcessorStream = (stream) => {
  // cleanup old processor
  if (audioProcessor) {
    audioProcessor.port.postMessage({ type: 'destroy' });
    audioProcessor = null;
  }

  return new Promise((resolve, reject) => {
    // create audio context first
    const audioContext = new AudioContext();

    // function to load audio worklet, called once audio context is running
    const loadAudioWorklet = async () => {
      const processorBlob = new Blob([loadedFiles.worklet], { type: 'text/javascript' });
      const processorURL = URL.createObjectURL(processorBlob);

      audioContext.audioWorklet.addModule(processorURL).then(() => {
        const contextSource = audioContext.createMediaStreamSource(stream);
        const contextDestination = audioContext.createMediaStreamDestination();

        const audioProcessorOptions = {
          channelCount: 1,
          numberOfInputs: 1,
          numberOfOutputs: 1,
          outputChannelCount: [1],
        };
        audioProcessor = new AudioWorkletNode(audioContext, 'mapi-proc', audioProcessorOptions);
        audioProcessor.port.onmessage = (event) => {
          if (event.data?.type === 'loaded') {
            audioProcessor.port.postMessage({ type: 'param', symbol: "intensity", value: 90 });
            audioProcessor.port.postMessage({ type: 'param', symbol: "leveler_target", value: -18 });
            audioProcessor.port.postMessage({ type: 'param', symbol: "sb_strength", value: 60 });
            audioProcessor.port.postMessage({ type: 'param', symbol: "mb_strength", value: 60 });
            audioProcessor.port.postMessage({ type: 'param', symbol: "pre_gain", value: 2 });
            audioProcessor.port.postMessage({ type: 'param', symbol: "post_gain", value: 0 });
            resolve(contextDestination.stream);
          } else if (event.data?.type === 'error') {
            reject(event.data.error);
          }
        };
        audioProcessor.port.postMessage({ type: 'init', wasm: loadedFiles.wasmBlob, js: loadedFiles.wasmJS });

        contextSource.connect(audioProcessor);
        audioProcessor.connect(contextDestination);
      }).catch(reject);
    };

    // Firefox allows to resume right away, while Chrome does not
    // handle both cases here
    audioContext.resume().then(loadAudioWorklet).catch((err) => {
      // Chrome does not allow to load worklet while audio context is suspended
      // resuming audio context requires user interaction
      if (audioContext.state === 'suspended') {
        const resume = () => {
          audioContext.resume().then(loadAudioWorklet).catch(reject);
          document.removeEventListener('click', resume);
        };
        document.addEventListener('click', resume);
      } else {
        reject(err);
      }
    });
  });
};

const isWasmProcessorSupported = () => {
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

// load processor files, trigger Promise resolve when all done
const loadWasmProcessorFiles = () => new Promise((resolve, reject) => {
  // early check
  if (!isWasmProcessorSupported()) {
    reject(wasmProcessorUnsupportedError);
    return;
  }

  const checkResolved = () => {
    if (loadedFiles.wasmBlob && loadedFiles.wasmJS && loadedFiles.worklet) {
      resolve(true);
      return true;
    }
    if (loadedFiles.error) {
      reject(loadedFiles.error);
      return true;
    }
    return false;
  };
  const catchHandler = (error) => {
    // only reject Promise once
    if (!loadedFiles.error) {
      loadedFiles.error = error;
      reject(loadedFiles.error);
    }
  };

  // try again in case of previous error
  loadedFiles.error = null;

  // return early if already loaded before
  if (checkResolved()) return;

  // check if SIMD is supported, needed for old Safari versions
  const supportsSIMD = WebAssembly.validate(
    // eslint-disable-next-line max-len
    new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11]),
  );

  // load wasm files and worklet
  const pathMatch = window.location.pathname.match('^(.*)/html5client/?$');
  const serverPathPrefix = pathMatch ? pathMatch[1] : '';
  const basepath = `${serverPathPrefix}/html5client/wasm/`;
  const suffix = supportsSIMD ? '' : '-nosimd';
  fetch(`${basepath}BBBA${suffix}-mapi.wasm`).then((resp) => {
    resp.arrayBuffer().then((bytes) => {
      loadedFiles.wasmBlob = bytes;
      checkResolved();
    }).catch(catchHandler);
  }).catch(catchHandler);
  fetch(`${basepath}BBBA${suffix}-mapi.js`).then((resp) => {
    resp.text().then((text) => {
      loadedFiles.wasmJS = text;
      checkResolved();
    }).catch(catchHandler);
  }).catch(catchHandler);
  fetch(`${basepath}mapi-proc.js`).then((resp) => {
    resp.text().then((text) => {
      loadedFiles.worklet = text;
      checkResolved();
    }).catch(catchHandler);
  }).catch(catchHandler);
});

// run-time changes to wasm processor
const setWasmProcessorEnabled = (enabled) => {
  if (audioProcessor) {
    audioProcessor.port.postMessage({ type: 'enable', enable: enabled });
  }
};

const setWasmProcessorParameter = (index, value) => {
  if (audioProcessor) {
    audioProcessor.port.postMessage({ type: 'param', index, value });
  }
};

export {
  createWasmProcessorStream,
  isWasmProcessorSupported,
  loadWasmProcessorFiles,
  setWasmProcessorEnabled,
  setWasmProcessorParameter,
};
