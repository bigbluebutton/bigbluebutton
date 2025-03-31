const stopTrack = (track) => {
  if (track && typeof track.stop === 'function' && track.readyState !== 'ended') {
    track.stop();
    // Manually emit the event as a safeguard; Firefox doesn't fire it when it
    // should with live MediaStreamTracks...
    const trackStoppedEvt = new MediaStreamTrackEvent('ended', { track });
    track.dispatchEvent(trackStoppedEvt);
  }
};

const stopStream = (stream) => {
  stream.getTracks().forEach(stopTrack);
};

const hasMediaDevicesEventTarget = () => typeof navigator?.mediaDevices?.addEventListener === 'function'
    && typeof navigator?.mediaDevices?.removeEventListener === 'function';

const silentConsole = {
  log: () => {},
  info: () => {},
  error: () => {},
  warn: () => {},
  debug: () => {},
  trace: () => {},
  assert: () => {},
};

export {
  hasMediaDevicesEventTarget,
  stopStream,
  stopTrack,
  silentConsole,
};
