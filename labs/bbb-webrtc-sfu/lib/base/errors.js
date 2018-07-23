const errorCodes =  {
  2000: "MEDIA_SERVER_CONNECTION_ERROR",
  2001: "MEDIA_SERVER_OFFLINE",
  2002: "MEDIA_SERVER_NO_RESOURCES",
  2003: "MEDIA_SERVER_REQUEST_TIMEOUT",
  2004: "MEDIA_SERVER_GENERIC_ERROR",
  2020: "ICE_ADD_CANDIDATE_FAILED",
  2021: "ICE_GATHERING_FAILED",
  2022: "ICE_STATE_FAILED",
  2200: "MEDIA_GENERIC_ERROR",
  2201: "MEDIA_NOT_FOUND",
  2202: "MEDIA_INVALID_SDP",
  2203: "MEDIA_NO_AVAILABLE_CODEC",
  2208: "MEDIA_GENERIC_PROCESS_ERROR",
  2209: "MEDIA_ADAPTER_OBJECT_NOT_FOUND",
  2210: "MEDIA_CONNECT_ERROR",
  2211: "MEDIA_NOT_FLOWING",
  2300: "SFU_INVALID_REQUEST",
}

const expandErrors = () => {
  let expandedErrors = Object.keys(errorCodes).reduce((map, key) => {
    map[errorCodes[key]] = { code: key, reason: errorCodes[key] };
    return map;
  }, {});

  return { ...errorCodes, ...expandedErrors };
}

module.exports = expandErrors();
