export const stopMediaStreamTracks = (stream) => {
  if (stream && typeof stream.getTracks === 'function') {
    stream.getTracks().forEach(track => {
      if (typeof track.stop === 'function') {
        track.stop();
      }
    });
  }
}

export const getVideoTracksFromStream = (stream) => {
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

export const getVideoTracksFromPeer = (peerConnection) => {
  let videoTracks = [];

  if (peerConnection && typeof peerConnection.getSenders === 'function') {
    videoTracks = peerConnection.getSenders()
      .map(sender => sender.track)
      .filter(track => track && track.kind === 'video');
  }

  return videoTracks;
}

/**
 * Generates a constraint intersection of argument $constraints with the output
 * of navigator.mediaDevices.getSupportedConstraints.
 * This avoids setting a constraint unsupported by browser.
 * In currently safari version (13+), for example,
 * setting an unsupported constraint causes rejection of the gUM or applyConstraints
 * calls.
 * Let one thing be clear: this is not a deep intersection that will assert whether
 * exact/advanced constraints work or not with a given device (e.g.: setting max/min
 * constraints). It is a SHALLOW intersection that only takes account of the
 * output of getSupportedConstraints.
 * @param  {Object} constraints An instance of MediaTrackConstraints to be intersected with getSupportedConstraints
 * see: https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
 * @return {Object}                        A new MediaStreamTrack object containing
 * only the supported constraints.
 */
export const filterSupportedConstraints = (constraints) => {
  const intersectedConstraints = {};
  let supportedConstraints = {}
  if (navigator.mediaDevices && typeof navigator.mediaDevices.getSupportedConstraints === 'function') {
    supportedConstraints = navigator.mediaDevices.getSupportedConstraints() || {};
  }

  return intersectTrackConstraints(constraints, supportedConstraints);
}

export const intersectTrackConstraints = (mstc1, mstc2 = {}) => {
  const intersectedConstraints = {};

  Object.entries(mstc1).forEach(
    ([constraintName, constraintValue]) => {
      if (mstc2[constraintName]) {
        intersectedConstraints[constraintName] = constraintValue;
      }
    }
  );

  return intersectedConstraints;
}

// Receives a MediaStreamTrack and a MediaTrackConstraints set
// Gets the current track constraints. If it has defined resolution
// parameters, generate a new MediaTrackConstraints enriched with those values
export const propagateTrackResolutionToConstraints = (track, constraints) => {
  if (typeof track.getSettings !== 'function'
    || (constraints.width || constraints.height)) {
    return constraints;
  }

  const trackSettings = track.getSettings();

  if (trackSettings.width && trackSettings.height) {
    return {
      ...constraints,
      width: trackSettings.width,
      height: trackSettings.height
    };
  } else {
    return constraints;
  }
}

export const applyVideoConstraints = (track, constraints) => {
  if (track == null || typeof track.applyConstraints !== 'function') return Promise.reject(new Error('NotSupportedError'));

  // Some browsers (mainly iOS Safari) garble the stream if a constraint is
  // reconfigured without propagating previous height/width info
  let enrichedConstraints = propagateTrackResolutionToConstraints(track, constraints);
  enrichedConstraints = filterSupportedConstraints(enrichedConstraints);

  return track.applyConstraints(enrichedConstraints)
}

// Apply constraints to video tracks from a MediaStream
export const applyVideoConstraintsToStream = (stream, constraints) => {
  const videoTracks = getVideoTracksFromStream(stream);

  // Something borked in the track fetching
  if (videoTracks.length === 0) return Promise.reject(new Error('NoVideoTracksError'));

  return Promise.all(
    videoTracks.map(track => {
      return applyVideoConstraints(track, constraints);
    })
  );
}

// Apply constraints to video tracks from a PeerConnection
export const applyVideoConstraintsToPeer = (peerConnection, constraints) => {
  const videoTracks = getVideoTracksFromPeer(peerConnection);

  // Something borked in the track fetching
  if (videoTracks.length === 0) return Promise.reject(new Error('NoVideoTracksError'));

  return Promise.all(
    videoTracks.map(track => {
      return applyVideoConstraints(track, constraints);
    })
  );
}
