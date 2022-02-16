package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs.UserLeaveReqMsg
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.{ RegisteredUsers, Users2x }
import org.bigbluebutton.core.running.{ HandlerHelpers, MeetingActor, OutMsgRouter }

trait UserLeaveReqMsgHdlr extends HandlerHelpers {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleUserLeaveReqMsg(msg: UserLeaveReqMsg, state: MeetingState2x): MeetingState2x = {
    Users2x.findWithIntId(liveMeeting.users2x, msg.body.userId) match {
      case Some(reconnectingUser) =>
        log.info("Received user left meeting. user {} meetingId={}", msg.body.userId, msg.header.meetingId)
        if (!reconnectingUser.userLeftFlag.left) {
          log.info("Setting user left flag. user {} meetingId={}", msg.body.userId, msg.header.meetingId)
          // Just flag that user has left as the user might be reconnecting.
          // An audit will remove this user if it hasn't rejoined after a certain period of time.
          // ralam oct 23, 2018
          sendUserLeftFlagUpdatedEvtMsg(outGW, liveMeeting, msg.body.userId, true);

          Users2x.setUserLeftFlag(liveMeeting.users2x, msg.body.userId)
        }
        if (msg.body.loggedOut) {
          log.info("Setting user logged out flag. user {} meetingId={}", msg.body.userId, msg.header.meetingId)

          for {
            ru <- RegisteredUsers.findWithUserId(msg.body.userId, liveMeeting.registeredUsers)
          } yield {
            RegisteredUsers.setUserLoggedOutFlag(liveMeeting.registeredUsers, ru)
          }
        }
        state
      case None =>
        state
    }
  }
}
