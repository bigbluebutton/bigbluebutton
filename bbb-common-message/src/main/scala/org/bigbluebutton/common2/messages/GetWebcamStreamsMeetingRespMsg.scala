package org.bigbluebutton.common2.messages


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