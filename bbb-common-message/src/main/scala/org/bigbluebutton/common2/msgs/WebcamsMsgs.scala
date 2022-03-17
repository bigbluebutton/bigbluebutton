package org.bigbluebutton.common2.msgs

// Broadcasting messages
object UserBroadcastCamStartedEvtMsg { val NAME = "UserBroadcastCamStartedEvtMsg" }
case class UserBroadcastCamStartedEvtMsg(
    header: BbbClientMsgHeader,
    body:   UserBroadcastCamStartedEvtMsgBody
) extends BbbCoreMsg
case class UserBroadcastCamStartedEvtMsgBody(
    userId: String,
    stream: String
)

object UserBroadcastCamStartMsg { val NAME = "UserBroadcastCamStartMsg" }
case class UserBroadcastCamStartMsg(
    header: BbbClientMsgHeader,
    body:   UserBroadcastCamStartMsgBody
) extends StandardMsg
case class UserBroadcastCamStartMsgBody(stream: String)

object UserBroadcastCamStopMsg { val NAME = "UserBroadcastCamStopMsg" }
case class UserBroadcastCamStopMsg(
    header: BbbClientMsgHeader,
    body:   UserBroadcastCamStopMsgBody
) extends StandardMsg
case class UserBroadcastCamStopMsgBody(stream: String)

object UserBroadcastCamStoppedEvtMsg { val NAME = "UserBroadcastCamStoppedEvtMsg" }
case class UserBroadcastCamStoppedEvtMsg(
    header: BbbClientMsgHeader,
    body:   UserBroadcastCamStoppedEvtMsgBody
) extends BbbCoreMsg
case class UserBroadcastCamStoppedEvtMsgBody(
    userId: String,
    stream: String
)

/* Sent by bbb-webrtc-sfu to ask permission for broadcasting a webcam
 */
object GetCamBroadcastPermissionReqMsg { val NAME = "GetCamBroadcastPermissionReqMsg" }
case class GetCamBroadcastPermissionReqMsg(
    header: BbbClientMsgHeader,
    body:   GetCamBroadcastPermissionReqMsgBody
) extends StandardMsg
case class GetCamBroadcastPermissionReqMsgBody(
    meetingId:    String,
    userId:       String,
    streamId:     String,
    sfuSessionId: String
)

/* Sent to bbb-webrtc-sfu to grant or deny webcam broadcasting permission
 */
object GetCamBroadcastPermissionRespMsg { val NAME = "GetCamBroadcastPermissionRespMsg" }
case class GetCamBroadcastPermissionRespMsg(
    header: BbbClientMsgHeader,
    body:   GetCamBroadcastPermissionRespMsgBody
) extends StandardMsg
case class GetCamBroadcastPermissionRespMsgBody(
    meetingId:    String,
    userId:       String,
    streamId:     String,
    sfuSessionId: String,
    allowed:      Boolean
)

/* Sent by bbb-webrtc-sfu to ask permission for subscring to a broadcasted
 * webcam stream
 */
object GetCamSubscribePermissionReqMsg { val NAME = "GetCamSubscribePermissionReqMsg" }
case class GetCamSubscribePermissionReqMsg(
    header: BbbClientMsgHeader,
    body:   GetCamSubscribePermissionReqMsgBody
) extends StandardMsg
case class GetCamSubscribePermissionReqMsgBody(
    meetingId:    String,
    userId:       String,
    streamId:     String,
    sfuSessionId: String
)

/* Sent to bbb-webrtc-sfu to grant or deny a webcam request
 */
object GetCamSubscribePermissionRespMsg { val NAME = "GetCamSubscribePermissionRespMsg" }
case class GetCamSubscribePermissionRespMsg(
    header: BbbClientMsgHeader,
    body:   GetCamSubscribePermissionRespMsgBody
) extends StandardMsg
case class GetCamSubscribePermissionRespMsgBody(
    meetingId:    String,
    userId:       String,
    streamId:     String,
    sfuSessionId: String,
    allowed:      Boolean
)

/**
 * Sent to bbb-webrtc-sfu to eject all media streams from #userId
 */
object EjectUserFromSfuSysMsg { val NAME = "EjectUserFromSfuSysMsg" }
case class EjectUserFromSfuSysMsg(
    header: BbbCoreHeaderWithMeetingId,
    body:   EjectUserFromSfuSysMsgBody
) extends BbbCoreMsg
case class EjectUserFromSfuSysMsgBody(userId: String)

/**
 * Sent by the client to eject all cameras from user #userId
 */
object EjectUserCamerasCmdMsg { val NAME = "EjectUserCamerasCmdMsg" }
case class EjectUserCamerasCmdMsg(
    header: BbbClientMsgHeader,
    body:   EjectUserCamerasCmdMsgBody
) extends StandardMsg
case class EjectUserCamerasCmdMsgBody(userId: String)

/**
 * Sent to bbb-webrtc-sfu to tear down broadcaster stream #streamId
 */
object CamBroadcastStopSysMsg { val NAME = "CamBroadcastStopSysMsg" }
case class CamBroadcastStopSysMsg(
    header: BbbCoreBaseHeader,
    body:   CamBroadcastStopSysMsgBody
) extends BbbCoreMsg
case class CamBroadcastStopSysMsgBody(
    meetingId: String,
    userId:    String,
    streamId:  String
)

/**
 * Sent from bbb-webrtc-sfu to indicate that #userId unsubscribed from #streamId
 */
object CamBroadcastStoppedInSfuEvtMsg { val NAME = "CamBroadcastStoppedInSfuEvtMsg" }
case class CamBroadcastStoppedInSfuEvtMsg(
    header: BbbClientMsgHeader,
    body:   CamBroadcastStoppedInSfuEvtMsgBody
) extends StandardMsg
case class CamBroadcastStoppedInSfuEvtMsgBody(streamId: String)

/**
 * Sent to bbb-webrtc-sfu to detach #userId's subscribers from #streamId
 */
object CamStreamUnsubscribeSysMsg { val NAME = "CamStreamUnsubscribeSysMsg" }
case class CamStreamUnsubscribeSysMsg(
    header: BbbCoreBaseHeader,
    body:   CamStreamUnsubscribeSysMsgBody
) extends BbbCoreMsg
case class CamStreamUnsubscribeSysMsgBody(
    meetingId: String,
    userId:    String,
    streamId:  String
)

/**
 * Sent from bbb-webrtc-sfu to indicate that #userId unsubscribed from #streamId
 */
object CamStreamUnsubscribedInSfuEvtMsg { val NAME = "CamStreamUnsubscribedInSfuEvtMsg" }
case class CamStreamUnsubscribedInSfuEvtMsg(
    header: BbbClientMsgHeader,
    body:   CamStreamUnsubscribedInSfuEvtMsgBody
) extends StandardMsg
case class CamStreamUnsubscribedInSfuEvtMsgBody(
    streamId:           String, // Publisher's internal stream ID
    subscriberStreamId: String,
    sfuSessionId:       String // Subscriber's SFU session ID
)

/**
 * Sent from bbb-webrtc-sfu to indicate that #userId subscribed to #streamId
 */
object CamStreamSubscribedInSfuEvtMsg { val NAME = "CamStreamSubscribedInSfuEvtMsg" }
case class CamStreamSubscribedInSfuEvtMsg(
    header: BbbClientMsgHeader,
    body:   CamStreamSubscribedInSfuEvtMsgBody
) extends StandardMsg
case class CamStreamSubscribedInSfuEvtMsgBody(
    streamId:           String, // Publisher's internal stream ID
    subscriberStreamId: String,
    sfuSessionId:       String // Subscriber's SFU session ID
)

/**
 * Sync webcam state with bbb-html5
 */
object SyncGetWebcamInfoRespMsg { val NAME = "SyncGetWebcamInfoRespMsg" }
case class SyncGetWebcamInfoRespMsg(
    header: BbbClientMsgHeader,
    body:   SyncGetWebcamInfoRespMsgBody
) extends BbbCoreMsg

case class SyncGetWebcamInfoRespMsgBody(
    webcamListSync: Vector[WebcamStreamInfo]
)
case class WebcamStreamInfo(stream: String, userId: String, name: String, pin: Boolean, floor: Boolean, lastFloorTime: String)
