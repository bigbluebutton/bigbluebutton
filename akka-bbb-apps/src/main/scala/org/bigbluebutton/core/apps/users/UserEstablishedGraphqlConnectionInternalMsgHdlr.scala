package org.bigbluebutton.core.apps.users

import org.bigbluebutton.core.api.UserEstablishedGraphqlConnectionInternalMsg
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.running.{ HandlerHelpers, LiveMeeting, MeetingActor, OutMsgRouter }

trait UserEstablishedGraphqlConnectionInternalMsgHdlr extends HandlerHelpers {
  this: MeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleUserEstablishedGraphqlConnectionInternalMsg(msg: UserEstablishedGraphqlConnectionInternalMsg, state: MeetingState2x): MeetingState2x = {
    log.info("Received user established a graphql connection. user {} meetingId={}", msg.userId, liveMeeting.props.meetingProp.intId)
    Users2x.findWithIntId(liveMeeting.users2x, msg.userId) match {
      case Some(reconnectingUser) =>
        if (reconnectingUser.userLeftFlag.left) {
          log.info("Resetting flag that user left meeting. user {}", msg.userId)
          sendUserLeftFlagUpdatedEvtMsg(outGW, liveMeeting, msg.userId, leftFlag = false)
          Users2x.resetUserLeftFlag(liveMeeting.users2x, msg.userId)
        }
        state
      case None =>
        state
    }
  }
}

