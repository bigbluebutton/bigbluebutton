import bbbaProvider from './providers/bbba';
import workadventureDtlnProvider from './providers/workadventureDtln';

const PROVIDERS = {
  bbba: bbbaProvider,
  workadventureDtln: workadventureDtlnProvider,
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

// The provider seeds its own defaults as the plugin loads, so an admin's
// configured intensity has to be re-applied to every processor that gets
// built - not just the primary one - or a device switch, an echo test or an
// audio rejoin silently reverts to the provider default.
const createWasmProcessorStream = async (stream, { intensity } = {}) => {
  const {
    stream: outputStream, context, setEnabled, destroy, setParameter,
  } = await getActiveProvider().createProcessorStream(stream);

  const { intensityParamIndex } = getActiveProvider();

  if (typeof intensity === 'number' && typeof intensityParamIndex === 'number') {
    setParameter?.(intensityParamIndex, intensity);
  }

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

// Fallback for when the admin has configured no intensity of their own.
// Undefined for a provider that exposes no such parameter.
const getWasmProcessorDefaultIntensity = () => getActiveProvider().defaultIntensity;

// Voice isolation is the provider driven at maximum intensity, so it is only
// on offer where the provider exposes that knob - BBBA, not workadventureDtln.
const isVoiceIsolationSupported = () => typeof getActiveProvider()
  .intensityParamIndex === 'number';

export {
  adoptWasmProcessor,
  createWasmProcessorStream,
  destroyWasmProcessor,
  getActiveProviderId,
  getProviderForcedMicrophoneConstraints,
  getWasmProcessorDefaultIntensity,
  isVoiceIsolationSupported,
  isWasmProcessorSupported,
  loadWasmProcessorFiles,
  setWasmProcessorEnabled,
  setWasmProcessorParameter,
};
