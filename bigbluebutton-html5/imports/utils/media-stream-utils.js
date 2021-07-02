const stopMediaStreamTracks = (stream) => {
  if (stream && typeof stream.getTracks === 'function') {
    stream.getTracks().forEach(track => {
      if (typeof track.stop === 'function') {
        track.stop();
      }
    });
  }
}

const getVideoTracks = (stream) => {
  let videoTracks = [];

  if (stream) {
    if (typeof stream.getVideoTracks === 'function') {
      videoTracks = stream.getVideoTracks();
    } else if (typeof stream.getTracks === 'function') {
      videoTracks = stream.getTracks().filter(track => track.kind === 'video');
    }
  }

  return videoTracks;
}

const extractVideoDeviceId = (stream) => {
  // An empty string is the browser's default...
  let deviceId = '';
  const tracks = getVideoTracks(stream);

  if (tracks[0] && typeof tracks[0].getSettings === 'function') {
    const settings = tracks[0].getSettings();
    deviceId = settings.deviceId;
  }

  return deviceId;
}

export default {
  stopMediaStreamTracks,
  getVideoTracks,
  extractVideoDeviceId,
};
