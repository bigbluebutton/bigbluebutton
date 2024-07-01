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
  return '';
};

const extractDeviceIdFromStream = (stream, kind) => {
  // An empty string is the browser's default...
  let tracks = [];

  switch (kind) {
    case 'audio':
      tracks = getAudioTracks(stream);
      return getDeviceIdFromTrack(tracks[0]);
    case 'video':
      tracks = getVideoTracks(stream);
      return getDeviceIdFromTrack(tracks[0]);
    default: {
      return '';
    }
  }
};

export default {
  stopMediaStreamTracks,
  getVideoTracks,
  extractDeviceIdFromStream,
};
