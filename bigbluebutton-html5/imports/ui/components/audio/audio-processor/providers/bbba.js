import { isGenericWasmProcessingSupported } from '../wasmCapability';

// mapi_set_parameter addresses parameters by INDEX, not by name. The order is
// fixed by the Faust dsp and is exported in plugin/pregen/FaustPluginInfo.h of
// the BigBlueBetterAudio repository:
//   0 pre_gain  1 vad_ext  2 post_gain  3 leveler_target
//   4 mb_strength  5 sb_strength  6 limiter_gain (output)
// Extra parameters follow the Faust ones, so intensity is 7.
// These must be revisited if the dsp parameter list ever changes.
const BBBA_PARAM = {
  PRE_GAIN: 0,
  VAD_EXT: 1,
  POST_GAIN: 2,
  LEVELER_TARGET: 3,
  MB_STRENGTH: 4,
  SB_STRENGTH: 5,
  INTENSITY: 7,
};

const BBBA_DEFAULTS = {
  [BBBA_PARAM.INTENSITY]: 95,
  [BBBA_PARAM.LEVELER_TARGET]: -18,
  [BBBA_PARAM.SB_STRENGTH]: 60,
  [BBBA_PARAM.MB_STRENGTH]: 60,
  [BBBA_PARAM.PRE_GAIN]: 2,
  [BBBA_PARAM.POST_GAIN]: 0,
};

// files loaded during loadFiles()
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

// create audio worklet or script processor
// we rely on script processor because worklets must run at 128 block size, which is not possible on low-spec machines
// Firefox implements createMediaStreamTrackSource, which taps the track rather
// than going through the stream-level plumbing of createMediaStreamSource. That
// is the better behaved path there; Chrome does not implement it.
const createSourceNode = (audioContext, stream) => {
  const track = stream.getAudioTracks()[0];
  if (track && typeof audioContext.createMediaStreamTrackSource === 'function') {
    try {
      return audioContext.createMediaStreamTrackSource(track);
    } catch (error) {
      // fall through to the portable path
    }
  }
  return audioContext.createMediaStreamSource(stream);
};

const createWasmProcessor = (audioContext, stream) => new Promise((resolve, reject) => {
  const contextSource = createSourceNode(audioContext, stream);
  const contextDestination = audioContext.createMediaStreamDestination();

  if (!navigator.userAgent.match(/Android/i)) {
    // Using Audio Worklet
    // addModule re-runs the worklet script, and registerProcessor throws
    // NotSupportedError on a duplicate name. Harmless while every call gets a
    // fresh context, fatal the moment one is reused, so guard it per context.
    const addModuleOnce = () => {
      if (audioContext.__mapiModuleAdded) return Promise.resolve();
      const processorBlob = new Blob([loadedFiles.worklet], { type: 'text/javascript' });
      const processorURL = URL.createObjectURL(processorBlob);
      return audioContext.audioWorklet.addModule(processorURL).then(() => {
        audioContext.__mapiModuleAdded = true;
        URL.revokeObjectURL(processorURL);
      });
    };

    addModuleOnce().then(() => {
      const audioProcessorOptions = {
        channelCount: 1,
        numberOfInputs: 1,
        numberOfOutputs: 1,
        outputChannelCount: [1],
      };
      const processor = new AudioWorkletNode(audioContext, 'mapi-proc', audioProcessorOptions);
      processor.port.onmessage = (event) => {
        if (event.data?.type === 'loaded') {
          Object.entries(BBBA_DEFAULTS).forEach(([index, value]) => {
            processor.port.postMessage({ type: 'param', index: Number(index), value });
          });

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
  const jsfnBbba = new Function(`${loadedFiles.wasmJS}return mapi_bbba;`);
  const createModuleBbba = jsfnBbba.call();

  // audio setup
  const bufferSize = 8192;
  const numberOfInputs = 1;
  const numberOfOutputs = 1;
  const processor = audioContext.createScriptProcessor(bufferSize, numberOfInputs, numberOfOutputs);

  // create the wasm module and instance
  createModuleBbba({
    instantiateWasm: (imports, successCallback) => {
      WebAssembly.instantiate(loadedFiles.wasmBlob, imports)
        .then((output) => {
          successCallback(output.instance, output.module);
        })
        .catch(reject);
      return {};
    },
    postRun(module) {
      const handle = module._mapi_create(audioContext.sampleRate, bufferSize);

      const audioData = module._malloc(module.HEAPF32.BYTES_PER_ELEMENT * bufferSize);
      const audioPtrs = module._malloc(module.HEAPU32.BYTES_PER_ELEMENT);
      module.HEAPU32[(audioPtrs + (0 << 2)) >> 2] = audioData;

      let enabled = true;
      processor.onaudioprocess = (e) => {
        if (!enabled) {
          e.outputBuffer.copyToChannel(e.inputBuffer.getChannelData(0), 0);
          return;
        }

        let buffer = e.inputBuffer.getChannelData(0);

        for (let i = 0; i < bufferSize; ++i) {
          module.HEAPF32[(audioData + (i << 2)) >> 2] = buffer[i];
        }

        module._mapi_process(handle, audioPtrs, audioPtrs, bufferSize);

        buffer = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; ++i) {
          buffer[i] = module.HEAPF32[(audioData + (i << 2)) >> 2];
        }
      };

      // use same API as worklet for pushing changes
      processor.port = {
        postMessage: (data) => {
          switch (data.type) {
            case 'enable':
              enabled = !!data.enable;
              break;
            case 'param':
              module._mapi_set_parameter(handle, data.index, data.value);
              break;
            case 'destroy':
              break;
            default:
              break;
          }
        },
      };

      Object.entries(BBBA_DEFAULTS).forEach(([index, value]) => {
        module._mapi_set_parameter(handle, Number(index), value);
      });

      contextSource.connect(processor);
      processor.connect(contextDestination);
      resolve({ stream: contextDestination.stream, processor });
    },
  });
});

// load processor files, trigger Promise resolve when all done
const loadFiles = () => new Promise((resolve, reject) => {
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

  // These three are fetched from fixed URLs, unlike the webpack bundle which
  // carries a content hash and so can never go stale. Nothing sets
  // Cache-Control on /html5client/wasm, so a browser is free to keep serving a
  // cached copy after a redeploy - which pairs a NEW bundle with an OLD
  // worklet. That combination is silently broken rather than merely outdated:
  // the two disagree about the port protocol, every mapi_set_parameter call
  // throws in the worklet, and the plugin keeps its built-in defaults with no
  // signal on the main thread. 'no-cache' forces revalidation (a cheap 304
  // when unchanged) instead of blind reuse.
  const fetchOpts = { cache: 'no-cache' };

  // load wasm files and worklet
  const pathMatch = window.location.pathname.match('^(.*)/html5client/?$');
  const serverPathPrefix = pathMatch ? pathMatch[1] : '';
  const basepath = `${serverPathPrefix}/html5client/wasm/`;
  const suffix = supportsSIMD ? '' : '-nosimd';
  fetch(`${basepath}BBBA${suffix}-mapi.wasm`, fetchOpts).then((resp) => {
    resp.arrayBuffer().then((bytes) => {
      loadedFiles.wasmBlob = bytes;
      checkResolved();
    }).catch(catchHandler);
  }).catch(catchHandler);
  fetch(`${basepath}BBBA${suffix}-mapi.js`, fetchOpts).then((resp) => {
    resp.text().then((text) => {
      loadedFiles.wasmJS = text;
      checkResolved();
    }).catch(catchHandler);
  }).catch(catchHandler);
  fetch(`${basepath}mapi-proc.js`, fetchOpts).then((resp) => {
    resp.text().then((text) => {
      loadedFiles.worklet = text;
      checkResolved();
    }).catch(catchHandler);
  }).catch(catchHandler);
});

// create an audio processor on top of a stream, resolving to the contract
// shape the audio-processor dispatcher expects from every provider
const createProcessorStream = (stream) => new Promise((resolve, reject) => {
  // BBBA must run at 48 kHz: rnnoise is a 48 kHz model with a fixed 480-sample
  // frame and the wasm build contains no resampler, so feeding it another rate
  // degrades the denoising. Ask the context for 48 kHz and let the browser
  // resample the capture. Note this cannot be taken from the track: Firefox
  // does not report sampleRate in getSettings(), so the previous code resolved
  // to { sampleRate: undefined } and silently fell back to the device rate.
  let audioContext;
  try {
    audioContext = new AudioContext({ sampleRate: 48000 });
  } catch (error) {
    // a browser may refuse an explicit rate; carry on rather than fail outright
    audioContext = new AudioContext();
  }
  if (audioContext.sampleRate !== 48000) {
    // eslint-disable-next-line no-console
    console.warn(`BBBA: AudioContext is at ${audioContext.sampleRate} Hz, rnnoise expects 48000 Hz`);
  }
  const closeAndReject = (error) => {
    audioContext.close?.().catch(() => {});
    reject(error);
  };

  const loadAudioWorklet = () => {
    createWasmProcessor(audioContext, stream).then(({ stream: outputStream, processor }) => {
      resolve({
        stream: outputStream,
        context: audioContext,
        setEnabled: (enabled) => processor.port.postMessage({ type: 'enable', enable: enabled }),
        destroy: () => processor.port.postMessage({ type: 'destroy' }),
        setParameter: (index, value) => processor.port.postMessage({ type: 'param', index, value }),
      });
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

// No forced constraints - BBBA has no requirement that must override an
// admin's explicit media.audio.audioWasmProcessing.constraints choice.
const forcedMicrophoneConstraints = {};

const isSupported = () => isGenericWasmProcessingSupported();

export default {
  isSupported,
  loadFiles,
  createProcessorStream,
  forcedMicrophoneConstraints,
  // Intensity is the only BBBA parameter an admin can retune from
  // settings.yml. Advertised here rather than hardcoding index 7 at the call
  // site, so a provider without such a knob - workadventureDtln - simply omits
  // both and the config key becomes a no-op for it.
  intensityParamIndex: BBBA_PARAM.INTENSITY,
  defaultIntensity: BBBA_DEFAULTS[BBBA_PARAM.INTENSITY],
};
