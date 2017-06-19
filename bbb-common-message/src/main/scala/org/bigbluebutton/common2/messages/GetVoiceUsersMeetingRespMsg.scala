package org.bigbluebutton.common2.messages

object GetVoiceUsersMeetingRespMsg {
  val NAME = "GetVoiceUsersMeetingRespMsg"

  def apply(meetingId: String, userId: String, users: Vector[VoiceConfUser]): GetVoiceUsersMeetingRespMsg = {
    val header = BbbClientMsgHeader(GetVoiceUsersMeetingRespMsg.NAME, meetingId, userId)

    val body = GetVoiceUsersMeetingRespMsgBody(users)
    GetVoiceUsersMeetingRespMsg(header, body)
  }
}

case class GetVoiceUsersMeetingRespMsg(header: BbbClientMsgHeader, body: GetVoiceUsersMeetingRespMsgBody) extends BbbCoreMsg
case class GetVoiceUsersMeetingRespMsgBody(users: Vector[VoiceConfUser])

case class VoiceConfUser(intId: String, voiceUserId: String, callingWith: String, callerName: String,
                         callerNum: String, muted: Boolean, talking: Boolean, listenOnly: Boolean)