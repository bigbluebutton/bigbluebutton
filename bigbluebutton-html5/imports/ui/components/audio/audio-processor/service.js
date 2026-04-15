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

// The active audio processor for runtime control (setWasmProcessorEnabled/Parameter etc).
// Updated when a processor is adopted as the primary via doGUM.
let audioProcessor = null;

// Registry of all live {processor, audioContext} pairs, idx by output stream ID.
// Allows explicit cleanup of specific processors without affecting others
const processorRegistry = new Map();

// check if wasm processor is supported, assigned to undefined if not checked yet
let wasmProcessorUnsupportedError;

// create audio worklet or script processor
// we rely on script processor because worklets must run at 128 block size, which is not possible on low-spec machines
const createWasmProcessor = (audioContext, stream) => {
  return new Promise((resolve, reject) => {
    const contextSource = audioContext.createMediaStreamSource(stream);
    const contextDestination = audioContext.createMediaStreamDestination();

    if (! navigator.userAgent.match(/Android/i)) {
      // Using Audio Worklet
      const processorBlob = new Blob([loadedFiles.worklet], { type: 'text/javascript' });
      const processorURL = URL.createObjectURL(processorBlob);

      audioContext.audioWorklet.addModule(processorURL).then(() => {
        const audioProcessorOptions = {
          channelCount: 1,
          numberOfInputs: 1,
          numberOfOutputs: 1,
          outputChannelCount: [1],
        };
        const processor = new AudioWorkletNode(audioContext, 'mapi-proc', audioProcessorOptions);
        processor.port.onmessage = (event) => {
          if (event.data?.type === 'loaded') {
            processor.port.postMessage({ type: 'param', symbol: "intensity", value: 100 });
            processor.port.postMessage({ type: 'param', symbol: "leveler_target", value: -18 });
            processor.port.postMessage({ type: 'param', symbol: "sb_strength", value: 60 });
            processor.port.postMessage({ type: 'param', symbol: "mb_strength", value: 60 });
            processor.port.postMessage({ type: 'param', symbol: "pre_gain", value: 2 });
            processor.port.postMessage({ type: 'param', symbol: "post_gain", value: 0 });

            contextSource.connect(processor);
            processor.connect(contextDestination);
            resolve({ stream: contextDestination.stream, processor });
          } else if (event.data?.type === 'error') {
            reject(event.data.error);
          }
        };
        processor.port.postMessage({ type: 'init', wasm: loadedFiles.wasmBlob, js: loadedFiles.wasmJS });

      }).catch(reject);
      return;
    }

    // fallback with createScriptProcessor follows here

    // execute JS to expose the emscripten load module function
    const jsfn_bbba = new Function(loadedFiles.wasmJS + 'return mapi_bbba;');
    const create_module_bbba = jsfn_bbba.call();

    // audio setup
    const bufferSize = 8192;
    const numberOfInputs = 1;
    const numberOfOutputs = 1;
    const processor = audioContext.createScriptProcessor(bufferSize, numberOfInputs, numberOfOutputs);

    // create the wasm module and instance
    create_module_bbba({
      instantiateWasm: (imports, successCallback) => {
        WebAssembly.instantiate(loadedFiles.wasmBlob, imports)
        .then(output => {
          successCallback(output.instance, output.module);
        })
        .catch(reject);
        return {};
      },
      postRun: function(module) {
        const handle = module._mapi_create(audioContext.sampleRate, bufferSize);

        const audioData = module._malloc(module.HEAPF32.BYTES_PER_ELEMENT * bufferSize);
        const audioPtrs = module._malloc(module.HEAPU32.BYTES_PER_ELEMENT);
        module.HEAPU32[audioPtrs + (0 << 2) >> 2] = audioData;

        const maxSymbolLength = 255;
        const csymbolData = module._malloc(maxSymbolLength);
        const csymbol = (symbol) => {
          const len = Math.min(maxSymbolLength, module.lengthBytesUTF8(symbol) + 1);
          module.stringToUTF8(symbol, csymbolData, len);
          return csymbolData;
        }

        let enabled = true;
        processor.onaudioprocess = function (e) {
          if (! enabled) {
            e.outputBuffer.copyToChannel(e.inputBuffer.getChannelData(0), 0);
            return;
          }

          let buffer = e.inputBuffer.getChannelData(0);

          for (let i = 0; i < bufferSize; ++i)
            module.HEAPF32[audioData + (i << 2) >> 2] = buffer[i];

          module._mapi_process(handle, audioPtrs, audioPtrs, bufferSize);

          buffer = e.outputBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; ++i)
            buffer[i] = module.HEAPF32[audioData + (i << 2) >> 2];
        };

        // use same API as worklet for pushing changes
        processor.port = {
          postMessage: (data) => {
            switch (data.type)
            {
              case 'enable':
                enabled = !!data.enable;
                break;
              case 'param':
                module._mapi_set_parameter(handle, csymbol(data.symbol), data.value);
                break;
              case 'destroy':
                break;
            }
          },
        };

        contextSource.connect(processor);
        processor.connect(contextDestination);
        resolve({ stream: contextDestination.stream, processor });
      },
    });
  });
};

// create an audio processor on top of a stream, trigger Promise resolve with a processed stream
const createWasmProcessorStream = (stream) => new Promise((resolve, reject) => {
  // fetch sampleRate from stream
  const { sampleRate } = stream.getAudioTracks()[0]?.getSettings() || {};

  // create audio context first
  const audioContext = new AudioContext({ sampleRate });
  const closeAndReject = (error) => {
    audioContext.close?.().catch(() => {});
    reject(error);
  };

  // function to load audio worklet, called once audio context is running
  const loadAudioWorklet = () => {
    createWasmProcessor(audioContext, stream).then(({ stream: outputStream, processor }) => {
      processorRegistry.set(outputStream.id, {
        processor,
        context: audioContext,
      });
      resolve(outputStream);
    }).catch(closeAndReject);
  };

  // Firefox allows to resume right away, while Chrome does not
  // handle both cases here
  audioContext.resume().then(loadAudioWorklet).catch((err) => {
    // Chrome does not allow to load worklet while audio context is suspended
    // resuming audio context requires user interaction
    if (audioContext.state === 'suspended') {
      const resume = () => {
        audioContext.resume().then(loadAudioWorklet).catch(closeAndReject);
        document.removeEventListener('click', resume);
      };
      document.addEventListener('click', resume);
    } else {
      closeAndReject(err);
    }
  });
});

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

// Destroy a specific WASM processor by its output stream or stream ID.
const destroyWasmProcessor = (streamOrId) => {
  const streamId = typeof streamOrId === 'string' ? streamOrId : streamOrId?.id;

  if (!streamId) return;

  const entry = processorRegistry.get(streamId);

  if (!entry) return;

  entry.processor?.port?.postMessage({ type: 'destroy' });
  entry.context?.close?.().catch(() => {});
  processorRegistry.delete(streamId);

  // Clear the runtime processor var if it pointed to the destroyed processor
  if (audioProcessor === entry.processor) audioProcessor = null;
};

// Promote a processor (by its output stream) as the primary for runtime control.
// Only called by doGUM when adoptProcessorAsPrimary=true (default). Preview/transient
// processors should not be primary (e.g.: audio-settings/echo test)
const adoptWasmProcessor = (streamOrId) => {
  const streamId = typeof streamOrId === 'string' ? streamOrId : streamOrId?.id;
  const entry = streamId ? processorRegistry.get(streamId) : null;

  audioProcessor = entry?.processor || null;
};

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
  adoptWasmProcessor,
  createWasmProcessorStream,
  destroyWasmProcessor,
  isWasmProcessorSupported,
  loadWasmProcessorFiles,
  setWasmProcessorEnabled,
  setWasmProcessorParameter,
};
