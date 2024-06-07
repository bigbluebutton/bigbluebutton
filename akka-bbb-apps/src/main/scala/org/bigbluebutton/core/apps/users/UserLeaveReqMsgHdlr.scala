package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs.UserLeaveReqMsg
import org.bigbluebutton.core.api.{ UserClosedAllGraphqlConnectionsInternalMsg }
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.{ RegisteredUsers, Users2x }
import org.bigbluebutton.core.running.{ HandlerHelpers, MeetingActor, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.Sender

trait UserLeaveReqMsgHdlr extends HandlerHelpers {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleUserLeaveReqMsg(msg: UserLeaveReqMsg, state: MeetingState2x): MeetingState2x = {
    handleUserLeaveReq(msg.body.userId, msg.header.meetingId, msg.body.loggedOut, state)
  }

  def handleUserClosedAllGraphqlConnectionsInternalMsg(msg: UserClosedAllGraphqlConnectionsInternalMsg, state: MeetingState2x): MeetingState2x = {
    log.info("Received user closed all graphql connections. user {} meetingId={}", msg.userId, liveMeeting.props.meetingProp.intId)

    for {
      regUser <- RegisteredUsers.findWithUserId(msg.userId, liveMeeting.registeredUsers)
    } yield {
      RegisteredUsers.updateUserConnectedToGraphql(liveMeeting.registeredUsers, regUser, graphqlConnected = false)
    }

    handleUserLeaveReq(msg.userId, liveMeeting.props.meetingProp.intId, loggedOut = false, state)
  }

  def handleUserLeaveReq(userId: String, meetingId: String, loggedOut: Boolean, state: MeetingState2x): MeetingState2x = {
    Users2x.findWithIntId(liveMeeting.users2x, userId) match {
      case Some(reconnectingUser) =>
        log.info("Received user left meeting. user {} meetingId={}", userId, meetingId)
        if (!reconnectingUser.userLeftFlag.left) {
          log.info("Setting user left flag. user {} meetingId={}", userId, meetingId)
          // Just flag that user has left as the user might be reconnecting.
          // An audit will remove this user if it hasn't rejoined after a certain period of time.
          // ralam oct 23, 2018
          sendUserLeftFlagUpdatedEvtMsg(outGW, liveMeeting, userId, leftFlag = true)

          Users2x.setUserLeftFlag(liveMeeting.users2x, userId)
        }
        if (loggedOut) {
          log.info("Setting user logged out flag. user {} meetingId={}", userId, meetingId)

          for {
            ru <- RegisteredUsers.findWithUserId(userId, liveMeeting.registeredUsers)
          } yield {
            RegisteredUsers.setUserLoggedOutFlag(liveMeeting.registeredUsers, ru)
            Sender.sendForceUserGraphqlReconnectionSysMsg(liveMeeting.props.meetingProp.intId, ru.id, ru.sessionToken, "user_loggedout", outGW)
          }
        }
        state
      case None =>
        state
    }
  }

}
