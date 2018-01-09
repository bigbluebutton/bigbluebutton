/*
 * (C) Copyright 2016 Mconf Tecnologia (http://mconf.com/)
 */

/**
 * @classdesc
 * Message constants for the communication with BigBlueButton
 * @constructor
 */

'use strict'

exports.ALL = 'ALL'

exports.LOG_LEVEL = {}
exports.LOG_LEVEL.DEBUG = 0
exports.LOG_LEVEL.INFO = 1
exports.LOG_LEVEL.WARN = 2
exports.LOG_LEVEL.ERROR = 3
exports.LOG_LEVEL.OFF = 100

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

// Observer Constants
exports.EVENT = {}
exports.EVENT.DIAL_EVENT = "BRIDGE_DIAL"
exports.EVENT.HANGUP_EVENT = "BRIDGE_HANGUP"
exports.EVENT.SESSION_ID_EVENT = "SESSION_ID"
exports.EVENT.AUDIO_SESSION_TERMINATED = "AUDIO_SESSION_TERMINATED"

// Media server state changes 
exports.EVENT.NEW_SESSION = "NewSession"
exports.EVENT.MEDIA_STATE = {};
exports.EVENT.MEDIA_STATE.MEDIA_EVENT = "MediaEvent"
exports.EVENT.MEDIA_STATE.CHANGED = "MediaStateChanged"
exports.EVENT.MEDIA_STATE.FLOW_OUT = "MediaFlowOutStateChange"
exports.EVENT.MEDIA_STATE.FLOW_IN = "MediaFlowInStateChange"
exports.EVENT.MEDIA_STATE.ENDOFSTREAM = "EndOfStream"
exports.EVENT.MEDIA_STATE.ICE = "OnIceCandidate"



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
