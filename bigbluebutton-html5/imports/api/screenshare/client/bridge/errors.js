import {
  SFU_SERVER_SIDE_ERRORS
} from '/imports/ui/services/bbb-webrtc-sfu/broker-base-errors';

// Mapped getDisplayMedia errors. These are bridge agnostic
// See: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia
const GDM_ERRORS = {
  // Fallback error: 1130
  1130: 'GetDisplayMediaGenericError',
  1131: 'AbortError',
  1132: 'InvalidStateError',
  1133: 'OverconstrainedError',
  1134: 'TypeError',
  1135: 'NotFoundError',
  1136: 'NotAllowedError',
  1137: 'NotSupportedError',
  1138: 'NotReadableError',
};

// Import as many bridge specific errors you want in this utilitary and shove
// them into the error class slots down below.
const CLIENT_SIDE_ERRORS = {
  1101: "SIGNALLING_TRANSPORT_DISCONNECTED",
  1102: "SIGNALLING_TRANSPORT_CONNECTION_FAILED",
  1104: "SCREENSHARE_PLAY_FAILED",
  1105: "PEER_NEGOTIATION_FAILED",
  1107: "ICE_STATE_FAILED",
  1120: "MEDIA_TIMEOUT",
  1121: "UNKNOWN_ERROR",
};

const SERVER_SIDE_ERRORS =  {
  ...SFU_SERVER_SIDE_ERRORS,
}

const AGGREGATED_ERRORS = {
  ...CLIENT_SIDE_ERRORS,
  ...SERVER_SIDE_ERRORS,
  ...GDM_ERRORS,
}

const expandErrors = () => {
  const expandedErrors = Object.keys(AGGREGATED_ERRORS).reduce((map, key) => {
    map[AGGREGATED_ERRORS[key]] = { errorCode: key, errorMessage: AGGREGATED_ERRORS[key] };
    return map;
  }, {});

  return { ...AGGREGATED_ERRORS, ...expandedErrors };
}

const SCREENSHARING_ERRORS = expandErrors();

export {
  GDM_ERRORS,
  // All errors, [code]: [message]
  // Expanded errors. It's AGGREGATED + message: { errorCode, errorMessage }
  SCREENSHARING_ERRORS,
}
