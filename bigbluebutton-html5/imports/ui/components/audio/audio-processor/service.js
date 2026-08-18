import bbbaProvider from './providers/bbba';

const PROVIDERS = {
  bbba: bbbaProvider,
};
const DEFAULT_PROVIDER_ID = 'bbba';

const getActiveProviderId = () => {
  const configured = window.meetingClientSettings.public.media.audio
    .audioWasmProcessing.provider;
  return PROVIDERS[configured] ? configured : DEFAULT_PROVIDER_ID;
};

const getActiveProvider = () => PROVIDERS[getActiveProviderId()];

const getProviderForcedMicrophoneConstraints = () => getActiveProvider()
  .forcedMicrophoneConstraints;

// The active provider's control handle, for runtime calls
// (setWasmProcessorEnabled/Parameter). Updated when a processor is adopted
// as the primary via doGUM (bridge/service.js).
let activeProviderControl = null;

// Registry of all live {control, context} pairs, idx by output stream ID.
// Allows explicit cleanup of specific processors without affecting others
const processorRegistry = new Map();

const isWasmProcessorSupported = () => getActiveProvider().isSupported();

const loadWasmProcessorFiles = () => getActiveProvider().loadFiles();

const createWasmProcessorStream = async (stream) => {
  const {
    stream: outputStream, context, setEnabled, destroy, setParameter,
  } = await getActiveProvider().createProcessorStream(stream);

  processorRegistry.set(outputStream.id, {
    context,
    control: { setEnabled, destroy, setParameter },
  });

  return outputStream;
};

// Destroy a specific processor by its output stream or stream ID.
const destroyWasmProcessor = (streamOrId) => {
  const streamId = typeof streamOrId === 'string' ? streamOrId : streamOrId?.id;

  if (!streamId) return;

  const entry = processorRegistry.get(streamId);

  if (!entry) return;

  entry.control?.destroy?.();
  entry.context?.close?.().catch(() => {});
  processorRegistry.delete(streamId);

  if (activeProviderControl === entry.control) activeProviderControl = null;
};

// Promote a processor (by its output stream) as the primary for runtime control.
// Only called by doGUM when adoptProcessorAsPrimary=true (default). Preview/transient
// processors should not be primary (e.g.: audio-settings/echo test)
const adoptWasmProcessor = (streamOrId) => {
  const streamId = typeof streamOrId === 'string' ? streamOrId : streamOrId?.id;
  const entry = streamId ? processorRegistry.get(streamId) : null;

  activeProviderControl = entry?.control || null;
};

const setWasmProcessorEnabled = (enabled) => {
  activeProviderControl?.setEnabled?.(enabled);
};

const setWasmProcessorParameter = (index, value) => {
  activeProviderControl?.setParameter?.(index, value);
};

export {
  adoptWasmProcessor,
  createWasmProcessorStream,
  destroyWasmProcessor,
  getProviderForcedMicrophoneConstraints,
  isWasmProcessorSupported,
  loadWasmProcessorFiles,
  setWasmProcessorEnabled,
  setWasmProcessorParameter,
};
