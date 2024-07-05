import playAndRetry from '/imports/utils/mediaElementPlayRetry';

const playMediaElement = (mediaElement) => {
  return new Promise((resolve, reject) => {
    if (mediaElement.paused) {
      // Tag isn't playing yet. Play it.
      mediaElement.play()
        .then(resolve)
        .catch((error) => {
          if (error.name === 'NotAllowedError') return reject(error);
          // Tag failed for reasons other than autoplay. Log the error and
          // try playing again a few times until it works or fails for good
          const played = playAndRetry(mediaElement);
          if (!played) return reject(error);
          return resolve();
        });
    } else {
      // Media tag is already playing, so log a success. This is really a
      // logging fallback for a case that shouldn't happen. But if it does
      // (ie someone re-enables the autoPlay prop in the mediaElement), then it
      // means the mediaStream is playing properly and it'll be logged.
      return resolve();
    }
  });
}

export default function loadAndPlayMediaStream (mediaStream, mediaElement, muted = true) {
  mediaElement.muted = muted;
  mediaElement.pause();
  mediaElement.srcObject = mediaStream;
  return playMediaElement(mediaElement);
}
