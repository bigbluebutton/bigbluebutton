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
  // BBBA-mapi.wasm or BBBA-nosimd-mapi.wasm, depending on the browser
  wasmURL: null,
  // compiled WebAssembly.Module, shared by every processor instance
  wasmModule: null,
  // BBBA-mapi.js (emscripten glue)
  wasmJS: null,
  // mapi-proc.js
  worklet: null,
};

// These are fetched from fixed URLs, unlike the webpack bundle which carries
// a content hash and so can never go stale. Nothing sets Cache-Control on
// /html5client/wasm, so a browser is free to keep serving a cached copy after
// a redeploy - which pairs a NEW bundle with an OLD worklet. That combination
// is silently broken rather than merely outdated: the two disagree about the
// port protocol, and the plugin does not load or keeps its built-in defaults.
// 'no-cache' forces revalidation (a cheap 304 when unchanged) instead of blind
// reuse.
const fetchOpts = { cache: 'no-cache' };

// fetch that rejects on HTTP errors, instead of handing an error page on
const fetchOk = (url) => fetch(url, fetchOpts).then((resp) => {
  if (!resp.ok) throw new Error(`${url}: HTTP ${resp.status}`);
  return resp;
});

const fetchBytes = (url) => fetchOk(url).then((resp) => resp.arrayBuffer());

// Compile while the file downloads. compileStreaming needs the server to send
// Content-Type: application/wasm; compile from the bytes when it does not.
const compileWasm = (url) => {
  if (typeof WebAssembly.compileStreaming !== 'function') {
    return fetchBytes(url).then((bytes) => WebAssembly.compile(bytes));
  }
  return WebAssembly.compileStreaming(fetchOk(url))
    .catch(() => fetchBytes(url).then((bytes) => WebAssembly.compile(bytes)));
};

// create audio worklet or script processor
// we rely on script processor because worklets must run at 128 block size,
// which is not possible on low-spec machines
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

// contexts that already have the worklet module added
const contextsWithModule = new WeakSet();

const createWasmProcessor = (audioContext, stream) => new Promise((resolve, reject) => {
  const contextSource = createSourceNode(audioContext, stream);
  const contextDestination = audioContext.createMediaStreamDestination();

  if (!navigator.userAgent.match(/Android/i)) {
    // Using Audio Worklet
    // addModule re-runs the worklet script, and registerProcessor throws
    // NotSupportedError on a duplicate name. Harmless while every call gets a
    // fresh context, fatal the moment one is reused, so guard it per context.
    // The emscripten glue goes in front of the processor in the same module,
    // which defines mapi_bbba there without an eval (so a CSP without
    // 'unsafe-eval' is fine).
    const addModuleOnce = () => {
      if (contextsWithModule.has(audioContext)) return Promise.resolve();
      const processorBlob = new Blob(
        [loadedFiles.wasmJS, '\n', loadedFiles.worklet],
        { type: 'text/javascript' },
      );
      const processorURL = URL.createObjectURL(processorBlob);
      return audioContext.audioWorklet.addModule(processorURL).then(() => {
        contextsWithModule.add(audioContext);
        URL.revokeObjectURL(processorURL);
      });
    };

    addModuleOnce().then(() => {
      const audioProcessorOptions = {
        // 'explicit' makes the browser downmix stereo capture to mono; the
        // default 'max' would ignore channelCount and the processor would only
        // see the left channel.
        channelCount: 1,
        channelCountMode: 'explicit',
        numberOfInputs: 1,
        numberOfOutputs: 1,
        outputChannelCount: [1],
      };
      const processor = new AudioWorkletNode(audioContext, 'mapi-proc', audioProcessorOptions);
      processor.port.onmessage = (event) => {
        switch (event.data?.type) {
          case 'loaded':
            Object.entries(BBBA_DEFAULTS).forEach(([index, value]) => {
              processor.port.postMessage({ type: 'param', index: Number(index), value });
            });

            contextSource.connect(processor);
            processor.connect(contextDestination);
            resolve({ stream: contextDestination.stream, processor });
            break;
          case 'error':
            reject(event.data.error);
            break;
          case 'need-bytes':
            // this browser cannot pass a compiled module to the worklet
            fetchBytes(loadedFiles.wasmURL).then((bytes) => {
              processor.port.postMessage({ type: 'init', wasm: bytes }, [bytes]);
            }).catch(reject);
            break;
          default:
            break;
        }
      };
      // The compiled module is shared with the worklet instead of copied.
      processor.port.postMessage({ type: 'init', wasm: loadedFiles.wasmModule });
    }).catch(reject);
    return;
  }

  // fallback with createScriptProcessor follows here

  // execute JS to expose the emscripten load module function. Android only:
  // without a worklet there is no module to put the glue in, so this path
  // still needs a CSP with 'unsafe-eval'.
  // eslint-disable-next-line no-new-func
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
      WebAssembly.instantiate(loadedFiles.wasmModule, imports)
        .then((instance) => {
          successCallback(instance, loadedFiles.wasmModule);
        })
        .catch(reject);
      return {};
    },
    postRun(module) {
      const handle = module._mapi_create(audioContext.sampleRate, bufferSize);

      const audioData = module._malloc(module.HEAPF32.BYTES_PER_ELEMENT * bufferSize);
      const audioPtrs = module._malloc(module.HEAPU32.BYTES_PER_ELEMENT);
      module.HEAPU32.set([audioData], audioPtrs / module.HEAPU32.BYTES_PER_ELEMENT);

      // memory growth detaches views, so check before every use
      let view = null;
      const heapView = () => {
        if (view === null || view.buffer !== module.HEAPF32.buffer) {
          view = new Float32Array(module.HEAPF32.buffer, audioData, bufferSize);
        }
        return view;
      };

      let enabled = true;
      processor.onaudioprocess = (e) => {
        if (!enabled) {
          e.outputBuffer.copyToChannel(e.inputBuffer.getChannelData(0), 0);
          return;
        }

        heapView().set(e.inputBuffer.getChannelData(0));
        module._mapi_process(handle, audioPtrs, audioPtrs, bufferSize);
        e.outputBuffer.copyToChannel(heapView(), 0);
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
let loadPromise = null;

const loadFiles = () => {
  // already loaded, or loading
  if (loadPromise) return loadPromise;

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
  const wasmURL = `${basepath}BBBA${suffix}-mapi.wasm`;

  loadPromise = Promise.all([
    compileWasm(wasmURL),
    fetchOk(`${basepath}BBBA${suffix}-mapi.js`).then((resp) => resp.text()),
    fetchOk(`${basepath}mapi-proc.js`).then((resp) => resp.text()),
  ]).then(([wasmModule, wasmJS, worklet]) => {
    loadedFiles.wasmURL = wasmURL;
    loadedFiles.wasmModule = wasmModule;
    loadedFiles.wasmJS = wasmJS;
    loadedFiles.worklet = worklet;
    return true;
  });

  // try again on the next call after a failure
  loadPromise.catch(() => { loadPromise = null; });

  return loadPromise;
};

// create an audio processor on top of a stream, resolving to the contract
// shape the audio-processor dispatcher expects from every provider
const createProcessorStream = (stream) => new Promise((resolve, reject) => {
  // BBBA runs at 48 kHz internally (rnnoise is a 48 kHz model) and resamples
  // any other context rate in and out itself, at some CPU cost. Ask the context
  // for 48 kHz so that cost is not paid on top of the browser's own capture
  // resampling. Note this cannot be taken from the track: Firefox does not
  // report sampleRate in getSettings(), so the previous code resolved to
  // { sampleRate: undefined } and silently fell back to the device rate.
  let audioContext;
  try {
    audioContext = new AudioContext({ sampleRate: 48000 });
  } catch (error) {
    // a browser may refuse an explicit rate; carry on rather than fail outright
    audioContext = new AudioContext();
  }
  if (audioContext.sampleRate !== 48000) {
    // eslint-disable-next-line no-console
    console.warn(`BBBA: AudioContext is at ${audioContext.sampleRate} Hz, resampling to 48000 Hz internally`);
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
