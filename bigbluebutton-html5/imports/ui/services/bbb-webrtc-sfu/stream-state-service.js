/*
 * The idea behind this whole utilitary is proving a decoupled way of propagating
 * peer connection states up and down the component tree without coming up with
 * weird trackers, hooks and/or prop drilling. This is mainly aimed at component
 * trees that aren't well organized in the first place (ie video-provider).
 * The base use case for this is notifying stream state changes to correctly
 * handle UI for reconnection scenarios.
 */

const STREAM_STATE_CHANGED_EVENT_PREFIX = 'streamStateChanged';

/*
 * The event name format for notify/subscribe/unsubscribe is
 * `${STREAM_STATE_CHANGED_EVENT_PREFIX}:${eventTag}`. eventTag can be any string.
 * streamState must be a valid member of either RTCIceConnectionState or
 * RTCPeerConnectionState enums
 */
export const  notifyStreamStateChange = (eventTag, streamState) => {
  const eventName = `${STREAM_STATE_CHANGED_EVENT_PREFIX}:${eventTag}`;
  const streamStateChanged = new CustomEvent(
    eventName,
    { detail: { eventTag, streamState } },
  );
  window.dispatchEvent(streamStateChanged);
}

// `callback` is the method to be called when a new state is notified
// via notifyStreamStateChange
export const subscribeToStreamStateChange = (eventTag, callback) => {
  const eventName = `${STREAM_STATE_CHANGED_EVENT_PREFIX}:${eventTag}`;
  window.addEventListener(eventName, callback, false);
}

export const unsubscribeFromStreamStateChange = (eventTag, callback) => {
  const eventName = `${STREAM_STATE_CHANGED_EVENT_PREFIX}:${eventTag}`;
  window.removeEventListener(eventName, callback);
}

export const isStreamStateUnhealthy = (streamState) => {
  return streamState === 'disconnected' || streamState === 'failed' || streamState === 'closed';
}

export const isStreamStateHealthy = (streamState) => {
  return streamState === 'connected' || streamState === 'completed';
}
