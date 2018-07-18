/**
 * @classdesc
 * Message constants for the communication with BigBlueButton
 * @constructor
 */

'use strict'

exports.ALL = 'ALL'

exports.STATUS = {}
exports.STATUS.STARTED = "STARTED"
exports.STATUS.STOPPED = "STOPPED"
exports.STATUS.RUNNING = "RUNNING'"
exports.STATUS.STARTING = "STARTING"
exports.STATUS.STOPPING = "STOPPING"
exports.STATUS.RESTARTING = "RESTARTING"

exports.USERS = {}
exports.USERS.SFU = "SFU"
exports.USERS.MCU = "MCU"

exports.MEDIA_TYPE = {}
exports.MEDIA_TYPE.WEBRTC = "WebRtcEndpoint"
exports.MEDIA_TYPE.RTP= "RtpEndpoint"
exports.MEDIA_TYPE.URI = "PlayerEndpoint"
exports.MEDIA_TYPE.RECORDING = "RecorderEndpoint";

// Media server state changes
exports.EVENT = {}
exports.EVENT.MEDIA_SERVER_ONLINE = "MediaServerOnline"
exports.EVENT.NEW_MEDIA_SESSION = "NewMediaSession"
exports.EVENT.MEDIA_SESSION_STOPPED = "MediaSessionStopped"
exports.EVENT.MEDIA_STATE = {};
exports.EVENT.MEDIA_STATE.MEDIA_EVENT = "MediaEvent"
exports.EVENT.MEDIA_STATE.CHANGED = "MediaStateChanged"
exports.EVENT.MEDIA_STATE.FLOW_OUT = "MediaFlowOutStateChange"
exports.EVENT.MEDIA_STATE.FLOW_IN = "MediaFlowInStateChange"
exports.EVENT.MEDIA_STATE.ENDOFSTREAM = "EndOfStream"
exports.EVENT.MEDIA_STATE.ICE = "OnIceCandidate"
exports.EVENT.SERVER_STATE = "ServerState"

exports.EVENT.RECORDING = {};
exports.EVENT.RECORDING.STOPPED = 'Stopped';
exports.EVENT.RECORDING.STARTED = 'Started';
exports.EVENT.RECORDING.PAUSED = 'Paused';

// Error codes
exports.ERROR = {};
exports.ERROR.MIN_CODE = 2000;
exports.ERROR.MAX_CODE = 2999;
exports.ERROR.CONNECTION_ERROR = { code: 2000, message: "MEDIA_SERVER_CONNECTION_ERROR" };
exports.ERROR.MEDIA_SERVER_OFFLINE = { code: 2001, message: "MEDIA_SERVER_OFFLINE" };
exports.ERROR.MEDIA_SERVER_NO_RESOURCES = { code: 2002, message: "MEDIA_SERVER_NO_RESOURCES" };
exports.ERROR.ICE_CANDIDATE_FAILED = { code: 2003, message: "ICE_ADD_CANDIDATE_FAILED" };
exports.ERROR.ICE_GATHERING_FAILED = { code: 2004, message: "ICE_GATHERING_FAILED" };
exports.ERROR.MEDIA_SERVER_REQUEST_TIMEOUT = { code: 2005, message: "MEDIA_SERVER_REQUEST_TIMEOUT" };
exports.ERROR.MEDIA_SERVER_GENERIC_ERROR = { code: 2006, message: "MEDIA_SERVER_GENERIC_ERROR" };

exports.ERROR.ROOM_GENERIC_ERROR = { code: 2100, message: "ROOM_GENNERIC_ERROR" };
exports.ERROR.ROOM_NOT_FOUND = { code: 2101, message: "ROOM_NOT_FOUND" };
exports.ERROR.USER_GENERIC_ERROR = { code: 2110, message: "USER_GENERIC_ERROR" };
exports.ERROR.USER_NOT_FOUND = { code: 2111, message: "USER_NOT_FOUND" };

exports.ERROR.MEDIA_GENERIC_ERROR = { code: 2200, message: "MEDIA_GENERIC_ERROR" };
exports.ERROR.MEDIA_NOT_FOUND = { code: 2201, message: "MEDIA_NOT_FOUND" };
exports.ERROR.MEDIA_INVALID_SDP = { code: 2202, message: "MEDIA_INVALID_SDP" };
exports.ERROR.MEDIA_NO_AVAILABLE_CODEC = { code: 2203, message: "MEDIA_NO_AVAILABLE_CODEC" };
exports.ERROR.MEDIA_INVALID_TYPE = { code: 2204, message: "MEDIA_INVALID_TYPE" };
exports.ERROR.MEDIA_INVALID_OPERATION = { code: 2205, message: "MEDIA_INVALID_OPERATION" };
exports.ERROR.MEDIA_PROCESS_OFFER_FAILED = { code: 2206, message : "MEDIA_PROCESS_OFFER_FAILED" };
exports.ERROR.MEDIA_PROCESS_ANSWER_FAILED = { code: 2207, message : "MEDIA_PROCESS_ANSWER_FAILED" };
exports.ERROR.MEDIA_GENERIC_PROCESS_ERROR = { code: 2208, message: "MEDIA_GENERIC_PROCESS_ERROR" };
exports.ERROR.MEDIA_ADAPTER_OBJECT_NOT_FOUND = { code: 2209, message: "MEDIA_ADAPTER_OBJECT_NOT_FOUND" };
exports.ERROR.MEDIA_CONNECT_ERROR = { code: 2210, message: "MEDIA_CONNECT_ERROR" };





// Freeswitch Adapter
exports.FREESWITCH = {};
exports.FREESWITCH.GLOBAL_AUDIO_PREFIX = "GLOBAL_AUDIO_";

// RTP params
exports.SDP = {};
exports.SDP.PARAMS = "params"
exports.SDP.MEDIA_DESCRIPTION = "media_description"
exports.SDP.LOCAL_IP_ADDRESS = "local_ip_address"
exports.SDP.LOCAL_VIDEO_PORT = "local_video_port"
exports.SDP.DESTINATION_IP_ADDRESS = "destination_ip_address"
exports.SDP.DESTINATION_VIDEO_PORT = "destination_video_port"
exports.SDP.REMOTE_VIDEO_PORT = "remote_video_port"
exports.SDP.CODEC_NAME = "codec_name"
exports.SDP.CODEC_ID = "codec_id"
exports.SDP.CODEC_RATE = "codec_rate"
exports.SDP.RTP_PROFILE = "rtp_profile"
exports.SDP.SEND_RECEIVE = "send_receive"
exports.SDP.FRAME_RATE = "frame_rate"

// Strings
exports.STRING = {}
exports.STRING.KURENTO = "Kurento"
exports.STRING.FREESWITCH = "Freeswitch"
exports.STRING.USER_AGENT = "MediaController"
exports.STRING.DEFAULT_NAME = "default"
exports.STRING.SIP_USER_AGENT = "SIP.js 0.7.8"
exports.STRING.ANONYMOUS = "ANONYMOUS"
exports.STRING.FS_USER_AGENT_STRING = "Freeswitch_User_Agent"
exports.STRING.XML_MEDIA_FAST_UPDATE = '<?xml version=\"1.0\" encoding=\"utf-8\" ?>' +
                                          '<media_control>' +
                                            '<vc_primitive>' +
                                              '<to_encoder>' +
                                                '<picture_fast_update>' +
                                                '</picture_fast_update>' +
                                              '</to_encoder>' +
                                            '</vc_primitive>' +
                                          '</media_control>'
