"use strict";

const config = require('config');
/**
 * @classdesc
 * Message constants for the communication with BigBlueButton
 * @constructor
 */
  function Constants () {
    return {
        // Media elements
        WebRTC: "WebRtcEndpoint",
        RTP: "RtpEndpoint",
        AUDIO: "AUDIO",
        VIDEO: "VIDEO",
        ALL: "ALL",

        // Redis channels
        FROM_BBB_TRANSCODE_SYSTEM_CHAN : "bigbluebutton:from-bbb-transcode:system",
        FROM_VOICE_CONF_SYSTEM_CHAN: "from-voice-conf-redis-channel",
        TO_BBB_TRANSCODE_SYSTEM_CHAN: "bigbluebutton:to-bbb-transcode:system",
        FROM_SCREENSHARE: config.get('from-screenshare'),
        TO_SCREENSHARE: config.get('to-screenshare'),
        FROM_VIDEO: config.get('from-video'),
        TO_VIDEO: config.get('to-video'),
        FROM_AUDIO: config.get('from-audio'),
        TO_AUDIO: config.get('to-audio'),
        TO_AKKA_APPS: config.get('to-akka'),

        // RedisWrapper events
        REDIS_MESSAGE : "redis_message",
        WEBSOCKET_MESAGE: "ws_message",
        GATEWAY_MESSAGE: "gateway_message",

        // Message identifiers 1x
        START_TRANSCODER_REQUEST: "start_transcoder_request_message",
        START_TRANSCODER_REPLY: "start_transcoder_reply_message",
        STOP_TRANSCODER_REQUEST: "stop_transcoder_request_message",
        STOP_TRANSCODER_REPLY: "stop_transcoder_reply_message",
        DESKSHARE_RTMP_BROADCAST_STARTED: "deskshare_rtmp_broadcast_started_message",
        DESKSHARE_RTMP_BROADCAST_STOPPED: "deskshare_rtmp_broadcast_stopped_message",

        //Message identifiers 2x
        SCREENSHARE_RTMP_BROADCAST_STARTED_2x: "ScreenshareRtmpBroadcastStartedVoiceConfEvtMsg",
        SCREENSHARE_RTMP_BROADCAST_STOPPED_2x: "ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsg",
        START_TRANSCODER_REQ_2x: "StartTranscoderSysReqMsg",
        START_TRANSCODER_RESP_2x: "StartTranscoderSysRespMsg",
        STOP_TRANSCODER_REQ_2x: "StopTranscoderSysReqMsg",
        STOP_TRANSCODER_RESP_2x: "StopTranscoderSysRespMsg",

        USER_CAM_BROADCAST_STOPPED_2x: "UserBroadcastCamStopMsg",

        // Redis messages fields
        //  Transcoder 1x
        USER_ID : "user_id",
        OPTIONS: "options",
        VOICE_CONF_ID : "voice_conf_id",
        TRANSCODER_ID : "transcoder_id",

        // Transcoder 2x
        USER_ID_2x : "userId",
        TRANSCODER_ID_2x : "transcoderId",
        MEETING_ID_2x: "meetingId",

        //  Screenshare 2x
        CONFERENCE_NAME: "voiceConf",
        SCREENSHARE_CONF: "screenshareConf",
        STREAM_URL: "stream",
        TIMESTAMP: "timestamp",
        VIDEO_WIDTH: "vidWidth",
        VIDEO_HEIGHT: "vidHeight",

        // RTP params
        MEETING_ID : "meeting_id",
        VOICE_CONF : "voice_conf",
        KURENTO_ENDPOINT_ID : "kurento_endpoint_id",
        PARAMS : "params",
        MEDIA_DESCRIPTION: "media_description",
        LOCAL_IP_ADDRESS: "local_ip_address",
        LOCAL_VIDEO_PORT: "local_video_port",
        DESTINATION_IP_ADDRESS : "destination_ip_address",
        DESTINATION_VIDEO_PORT : "destination_video_port",
        REMOTE_VIDEO_PORT : "remote_video_port",
        CODEC_NAME: "codec_name",
        CODEC_ID: "codec_id",
        CODEC_RATE: "codec_rate",
        RTP_PROFILE: "rtp_profile",
        SEND_RECEIVE: "send_receive",
        FRAME_RATE: "frame_rate",
        INPUT: "input",
        KURENTO_TOKEN : "kurento_token",
        SCREENSHARE: "deskShare",
        STREAM_TYPE: "stream_type",
        STREAM_TYPE_SCREENSHARE: "stream_type_deskshare",
        STREAM_TYPE_VIDEO: "stream_type_video",
        RTP_TO_RTMP: "transcode_rtp_to_rtmp",
        TRANSCODER_CODEC: "codec",
        TRANSCODER_TYPE: "transcoder_type",
        CALLERNAME: "callername",

        // Log prefixes
        BASE_PROCESS_PREFIX: '[BaseProcess]',
        BASE_MANAGER_PREFIX: '[BaseManager]',
        BASE_PROVIDER_PREFIX: '[BaseProvider]',
        SCREENSHARE_PROCESS_PREFIX: '[ScreenshareProcess]',
        SCREENSHARE_MANAGER_PREFIX: '[ScreenshareManager]',
        SCREENSHARE_PROVIDER_PREFIX: '[ScreenshareProvider]',
        VIDEO_PROCESS_PREFIX: '[VideoProcess]',
        VIDEO_MANAGER_PREFIX: '[VideoManager]',
        VIDEO_PROVIDER_PREFIX: '[VideoProvider]',

        // MCS error codes
        MEDIA_SERVER_OFFLINE: "1000"
    }
}

module.exports = Constants();

