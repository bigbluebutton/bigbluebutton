package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.common2.messages.users.UserJoinMeetingReqMsg
import org.bigbluebutton.core.{ MessageRecorder, OutMessageGateway }
import org.bigbluebutton.core.models.{ RegisteredUsers, UserState, Users2x }
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.message.senders.{ Sender, UserJoinedMeetingEvtMsgBuilder }

trait UserJoinMeetingReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handle(msg: UserJoinMeetingReqMsg): Unit = {
    userJoinMeeting(msg.body.authToken)
  }

  def userJoinMeeting(authToken: String): Unit = {
    log.debug("User joining with token {}", authToken)

    for {
      regUser <- RegisteredUsers.findWithToken(authToken, liveMeeting.registeredUsers)
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

      val event = UserJoinedMeetingEvtMsgBuilder.build(liveMeeting.props.meetingProp.intId, userState)
      Sender.send(outGW, event)

      MessageRecorder.record(outGW, liveMeeting.props.recordProp.record, event.core)

      if (!Users2x.hasPresenter(liveMeeting.users2x)) {
        automaticallyAssignPresenter()
      } else {
        log.debug("Not sending presenter.")
      }

    }
  }
}

