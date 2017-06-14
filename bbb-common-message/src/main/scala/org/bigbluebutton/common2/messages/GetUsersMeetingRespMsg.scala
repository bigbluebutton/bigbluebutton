package org.bigbluebutton.common2.messages

object GetUsersMeetingRespMsg {
  val NAME = "GetUsersMeetingRespMsg"

  def apply(meetingId: String, userId: String, users: Vector[WebUser]): GetUsersMeetingRespMsg = {
    val header = BbbClientMsgHeader(GetUsersMeetingRespMsg.NAME, meetingId, userId)

    val body = GetUsersMeetingRespMsgBody(users)
    GetUsersMeetingRespMsg(header, body)
  }

}

case class GetUsersMeetingRespMsg(header: BbbClientMsgHeader, body: GetUsersMeetingRespMsgBody) extends BbbCoreMsg
case class GetUsersMeetingRespMsgBody(users: Vector[WebUser])

case class WebUser(intId: String, extId: String, name: String, role: String,
                   guest: Boolean, authed: Boolean, waitingForAcceptance: Boolean, emoji: String, locked: Boolean,
                   presenter: Boolean, avatar: String)