package org.bigbluebutton.common2.messages

object UserLeftMeetingEvtMsg {
  val NAME = "UserLeftMeetingEvtMsg"

  def apply(meetingId: String, userId: String, body: UserLeftMeetingEvtMsgBody): UserLeftMeetingEvtMsg = {
    val header = BbbClientMsgHeader(UserLeftMeetingEvtMsg.NAME, meetingId, userId)
    UserLeftMeetingEvtMsg(header, body)
  }
}

case class UserLeftMeetingEvtMsg(header: BbbClientMsgHeader,
                                 body: UserLeftMeetingEvtMsgBody) extends BbbCoreMsg
case class UserLeftMeetingEvtMsgBody(intId: String)
