package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs.{ BbbClientMsgHeader, BbbCommonEnvCoreMsg, BbbCoreEnvelope, MessageTypes, Routing, UserMobileFlagChangedEvtMsg, UserMobileFlagChangedEvtMsgBody }
import org.bigbluebutton.core.api.UserEstablishedGraphqlConnectionInternalMsg
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.{ UserState, Users2x }
import org.bigbluebutton.core.running.{ HandlerHelpers, LiveMeeting, MeetingActor, OutMsgRouter }

trait UserEstablishedGraphqlConnectionInternalMsgHdlr extends HandlerHelpers {
  this: MeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleUserEstablishedGraphqlConnectionInternalMsg(msg: UserEstablishedGraphqlConnectionInternalMsg, state: MeetingState2x): MeetingState2x = {
    log.info("Received user established a graphql connection. user {} meetingId={}", msg.userId, liveMeeting.props.meetingProp.intId)
    Users2x.findWithIntId(liveMeeting.users2x, msg.userId) match {
      case Some(connectingUser) =>
        if (connectingUser.userLeftFlag.left) {
          log.info("Resetting flag that user left meeting. user {}", msg.userId)
          sendUserLeftFlagUpdatedEvtMsg(outGW, liveMeeting, msg.userId, leftFlag = false)
          Users2x.resetUserLeftFlag(liveMeeting.users2x, msg.userId)
        }

        if (connectingUser.mobile != msg.isMobile) {
          val userMobile = Users2x.setMobile(liveMeeting.users2x, connectingUser)
          broadcastUserMobileChanged(userMobile, msg.isMobile)
        }

        if (connectingUser.clientType != msg.clientType) {
          Users2x.setClientType(liveMeeting.users2x, connectingUser, msg.clientType)
        }

        state
      case None =>
        state
    }
  }

  def broadcastUserMobileChanged(user: UserState, mobile: Boolean): Unit = {
    val routingChange = Routing.addMsgToClientRouting(
      MessageTypes.BROADCAST_TO_MEETING,
      liveMeeting.props.meetingProp.intId, user.intId
    )
    val envelopeChange = BbbCoreEnvelope(UserMobileFlagChangedEvtMsg.NAME, routingChange)
    val headerChange = BbbClientMsgHeader(UserMobileFlagChangedEvtMsg.NAME, liveMeeting.props.meetingProp.intId,
      user.intId)

    val bodyChange = UserMobileFlagChangedEvtMsgBody(user.intId, mobile)
    val eventChange = UserMobileFlagChangedEvtMsg(headerChange, bodyChange)
    val msgEventChange = BbbCommonEnvCoreMsg(envelopeChange, eventChange)
    outGW.send(msgEventChange)
  }
}
