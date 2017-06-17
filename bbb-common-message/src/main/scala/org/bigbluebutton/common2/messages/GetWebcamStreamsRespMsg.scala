package org.bigbluebutton.common2.messages

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
