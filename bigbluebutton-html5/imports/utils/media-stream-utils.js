const stopMediaStreamTracks = (stream) => {
  if (stream && typeof stream.getTracks === 'function') {
    stream.getTracks().forEach((track) => {
      if (typeof track.stop === 'function' && track.readyState !== 'ended') {
        track.stop();
        // Manually emit the event as a safeguard; Firefox doesn't fire it when it
        // should with live MediaStreamTracks...
        const trackStoppedEvt = new MediaStreamTrackEvent('ended', { track });
        track.dispatchEvent(trackStoppedEvt);
      }
    });
  }
};

const getAudioTracks = (stream) => {
  if (stream) {
    if (typeof stream.getAudioTracks === 'function') {
      return stream.getAudioTracks();
    }

    if (typeof stream.getTracks === 'function') {
      return stream.getTracks().filter((track) => track.kind === 'audio');
    }
  }

  return [];
};

const getVideoTracks = (stream) => {
  if (stream) {
    if (typeof stream.getVideoTracks === 'function') {
      return stream.getVideoTracks();
    }

    if (typeof stream.getTracks === 'function') {
      return stream.getTracks().filter((track) => track.kind === 'video');
    }
  }

  return [];
};

const getDeviceIdFromTrack = (track) => {
  if (track && typeof track.getSettings === 'function') {
    const { deviceId } = track.getSettings();
    return deviceId;
  }
  return null;
};

// Maps synthetic WebAudio-* device IDs to real device IDs.
// WASM-processed streams (from AudioContext.createMediaStreamDestination) have
// a unique synthetic device ID per AudioContext. These IDs change on stream
// cloning as well, making things even more impractical.
// doGUM is charge of registering the mappings after WASM processing
const wasmDeviceIdMap = new Map();

const registerWasmDeviceId = (syntheticDeviceId, realDeviceId) => {
  if (syntheticDeviceId && realDeviceId) {
    wasmDeviceIdMap.set(syntheticDeviceId, realDeviceId);
  }
};

const resolveDeviceId = (deviceId) => wasmDeviceIdMap.get(deviceId) ?? deviceId;

const extractDeviceIdFromStream = (stream, kind) => {
  let tracks = [];

  switch (kind) {
    case 'audio':
      tracks = getAudioTracks(stream);
      if (tracks.length === 0) return 'listen-only';
      return resolveDeviceId(getDeviceIdFromTrack(tracks[0]));
    case 'video':
      tracks = getVideoTracks(stream);
      return getDeviceIdFromTrack(tracks[0]);
    default: {
      return null;
    }
  }
};

const getMediaStreamLogData = (stream) => {
  if (!stream) return { audio: [], video: [] };

  try {
    const audioTracks = getAudioTracks(stream);
    const videoTracks = getVideoTracks(stream);

    return {
      valid: true,
      active: stream.active,
      id: stream.id,
      audio: audioTracks.map((track) => ({
        id: track.id,
        enabled: track.enabled,
        deviceId: getDeviceIdFromTrack(track),
        label: track.label,
      })),
      video: videoTracks.map((track) => ({
        id: track.id,
        enabled: track.enabled,
        deviceId: getDeviceIdFromTrack(track),
        label: track.label,
      })),
    };
  } catch (error) {
    return { audio: [], video: [], valid: false };
  }
};

export default {
  stopMediaStreamTracks,
  getMediaStreamLogData,
  getVideoTracks,
  extractDeviceIdFromStream,
  registerWasmDeviceId,
};
