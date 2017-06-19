package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.common2.messages._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models.{ RegisteredUsers, UserState, Users2x }
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.message.senders.MessageSenders

trait UserJoinMeetingReqMsgHdlr extends MessageSenders {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleUserJoinMeetingReqMsg(msg: UserJoinMeetingReqMsg): Unit = {
    log.warning("Received user joined voice conference " + msg)

    for {
      regUser <- RegisteredUsers.findWithToken(msg.body.authToken, liveMeeting.registeredUsers)
    } yield {
      val userState = UserState(intId = regUser.id,
        extId = regUser.externId,
        name = regUser.name,
        role = regUser.role,
        guest = regUser.guest,
        authed = regUser.authed,
        waitingForAcceptance = regUser.waitingForAcceptance,
        emoji = "none",
        presenter = false,
        locked = false,
        avatar = regUser.avatarURL)

      Users2x.add(liveMeeting.users2x, userState)

      sendUserJoinedMeetingEvtMsg(liveMeeting.props.meetingProp.intId, userState, liveMeeting.props.recordProp.record)
    }

  }
}
