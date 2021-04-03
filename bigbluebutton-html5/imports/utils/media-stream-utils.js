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

export default {
  stopMediaStreamTracks,
  getVideoTracks,
};
