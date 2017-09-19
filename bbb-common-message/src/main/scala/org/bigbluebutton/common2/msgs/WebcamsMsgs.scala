package org.bigbluebutton.common2.msgs

object UserBroadcastCamStartedEvtMsg { val NAME = "UserBroadcastCamStartedEvtMsg" }
case class UserBroadcastCamStartedEvtMsg(header: BbbClientMsgHeader,
                                         body: UserBroadcastCamStartedEvtMsgBody) extends BbbCoreMsg
case class UserBroadcastCamStartedEvtMsgBody(userId: String, stream: String)

object UserBroadcastCamStartMsg { val NAME = "UserBroadcastCamStartMsg" }
case class UserBroadcastCamStartMsg(header: BbbClientMsgHeader, body: UserBroadcastCamStartMsgBody) extends StandardMsg
case class UserBroadcastCamStartMsgBody(stream: String, isHtml5Client: Boolean = false)

object UserBroadcastCamStopMsg { val NAME = "UserBroadcastCamStopMsg" }
case class UserBroadcastCamStopMsg(header: BbbClientMsgHeader, body: UserBroadcastCamStopMsgBody) extends StandardMsg
case class UserBroadcastCamStopMsgBody(stream: String, isHtml5Client: Boolean = false)

object UserBroadcastCamStoppedEvtMsg { val NAME = "UserBroadcastCamStoppedEvtMsg" }
case class UserBroadcastCamStoppedEvtMsg(header: BbbClientMsgHeader, body: UserBroadcastCamStoppedEvtMsgBody) extends BbbCoreMsg
case class UserBroadcastCamStoppedEvtMsgBody(userId: String, stream: String)

object GetWebcamStreamsMeetingRespMsg {
  val NAME = "GetWebcamStreamsMeetingRespMsg"

  def apply(meetingId: String, userId: String, streams: Vector[WebcamStreamVO]): GetWebcamStreamsMeetingRespMsg = {
    val header = BbbClientMsgHeader(GetWebcamStreamsMeetingRespMsg.NAME, meetingId, userId)

    val body = GetWebcamStreamsMeetingRespMsgBody(streams)
    GetWebcamStreamsMeetingRespMsg(header, body)
  }
}
case class GetWebcamStreamsMeetingRespMsg(header: BbbClientMsgHeader, body: GetWebcamStreamsMeetingRespMsgBody) extends BbbCoreMsg
case class GetWebcamStreamsMeetingRespMsgBody(streams: Vector[WebcamStreamVO])

case class WebcamStreamVO(streamId: String, stream: MediaStreamVO)
case class MediaStreamVO(id: String, url: String, userId: String, attributes: collection.immutable.Map[String, String], viewers: Set[String])


object GetWebcamStreamsRespMsg {
  val NAME = "GetWebcamStreamsRespMsg"

  def apply(meetingId: String, userId: String, webcamStreams: Vector[String]): GetWebcamStreamsRespMsg = {
    val header = BbbClientMsgHeader(GetWebcamStreamsRespMsg.NAME, meetingId, userId)

    val body = GetWebcamStreamsRespMsgBody(webcamStreams)
    GetWebcamStreamsRespMsg(header, body)
  }
}

case class GetWebcamStreamsRespMsg(header: BbbClientMsgHeader, body: GetWebcamStreamsRespMsgBody) extends BbbCoreMsg

case class GetWebcamStreamsRespMsgBody(webcamStreams: Vector[String])

