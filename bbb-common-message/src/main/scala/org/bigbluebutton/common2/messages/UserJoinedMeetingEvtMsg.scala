package org.bigbluebutton.common2.messages


object UserJoinedMeetingEvtMsg {
  val NAME = "UserJoinedMeetingEvtMsg"

  def apply(meetingId: String, userId: String, body: UserJoinedMeetingEvtMsgBody):UserJoinedMeetingEvtMsg = {
    val header = BbbClientMsgHeader(UserJoinedMeetingEvtMsg.NAME, meetingId, userId)
    UserJoinedMeetingEvtMsg(header, body)
  }
}

case class UserJoinedMeetingEvtMsg(header: BbbClientMsgHeader,
                                   body: UserJoinedMeetingEvtMsgBody) extends BbbCoreMsg
case class UserJoinedMeetingEvtMsgBody(intId: String, extId: String, name: String, role: String,
                                       guest: Boolean, authed: Boolean, waitingForAcceptance: Boolean, emoji: String,
                                       presenter: Boolean, locked: Boolean, avatar: String)