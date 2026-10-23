import { isGenericWasmProcessingSupported } from '../wasmCapability';

const SAMPLE_RATE = 16000;

const isSupported = () => isGenericWasmProcessingSupported();

// Resolved once and reused: the package memoizes the LiteRT wasm binary
// module-globally and the browser caches the worklet module, so a second
// prefetch would still re-instantiate LiteRT inside a throwaway worklet for
// nothing. Cleared on failure so a later join retries, as BBBA's loader does.
let prefetch = null;

const prefetchProcessorAssets = async () => {
  const { createNoiseSuppressionAudioWorklet } = await import('@workadventure/noise-suppression/audio-worklet');

  // OfflineAudioContext, not a real one: it is never rendered and carries no
  // autoplay gating, so this is safe to run outside a user gesture.
  const worklet = await createNoiseSuppressionAudioWorklet(
    new OfflineAudioContext(1, 1, SAMPLE_RATE),
  );

  try {
    await worklet.ready;
  } finally {
    worklet.dispose();
  }
};

const loadFiles = () => {
  if (!prefetch) {
    prefetch = prefetchProcessorAssets().catch((error) => {
      prefetch = null;
      throw error;
    });
  }

  return prefetch;
};

// Already resolved by loadFiles() on the join path; chained again here for
// the callers that create a stream without going through it.
const createProcessorStream = (stream) => import('@workadventure/noise-suppression/audio-worklet')
  .then(({ createNoiseSuppressionAudioWorklet }) => new Promise((resolve, reject) => {
    // DTLN operates at a fixed 16kHz/mono, unlike BBBA which runs at whatever
    // rate the source stream provides. MediaStreamAudioSourceNode resamples
    // the incoming track to the context's rate automatically.
    const context = new AudioContext({ sampleRate: SAMPLE_RATE });
    let worklet = null;

    const closeAndReject = (error) => {
      worklet?.dispose();
      context.close?.().catch(() => {});
      reject(error);
    };

    const setUpWorklet = () => {
      const source = context.createMediaStreamSource(stream);
      const destination = context.createMediaStreamDestination();

      // threads/numThreads default to false/unset - enabling them needs
      // COOP/COEP headers this client doesn't set today, so this stays on
      // the single-threaded default rather than requesting cross-origin
      // isolation.
      createNoiseSuppressionAudioWorklet(context).then((createdWorklet) => {
        worklet = createdWorklet;

        return worklet.ready.then(() => {
          source.connect(worklet.node);
          worklet.node.connect(destination);

          resolve({
            stream: destination.stream,
            context,
            // The package exposes no runtime enable/disable toggle -
            // dispose() is its only lifecycle control - so there's nothing
            // to wire up here.
            setEnabled: () => {},
            destroy: () => worklet.dispose(),
          });
        });
      }).catch(closeAndReject);
    };

    context.resume().then(setUpWorklet).catch(closeAndReject);
  }));

// The package's docs ask consumers to disable the browser's own
// noiseSuppression so it doesn't double-process the signal alongside DTLN.
// This is forced, not a default an admin's constraints could override:
// settings.yml ships audioWasmProcessing.constraints non-empty
// (noiseSuppression: true, tuned for BBBA), so a merely-overridable value
// would silently lose to that shipped default for any deployment that
// hasn't customized it - and running the browser's own noiseSuppression
// alongside DTLN actively degrades the signal DTLN receives.
const forcedMicrophoneConstraints = {
  noiseSuppression: false,
};

export default {
  isSupported,
  loadFiles,
  createProcessorStream,
  forcedMicrophoneConstraints,
};
