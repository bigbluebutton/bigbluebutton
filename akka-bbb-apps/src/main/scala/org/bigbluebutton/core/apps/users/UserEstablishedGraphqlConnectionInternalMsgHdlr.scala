package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs.{ BbbClientMsgHeader, BbbCommonEnvCoreMsg, BbbCoreEnvelope, MessageTypes, Routing, UserMobileFlagChangedEvtMsg, UserMobileFlagChangedEvtMsgBody }
import org.bigbluebutton.core.api.UserEstablishedGraphqlConnectionInternalMsg
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.{ RegisteredUsers, UserState, Users2x }
import org.bigbluebutton.core.running.{ HandlerHelpers, LiveMeeting, MeetingActor, OutMsgRouter }

trait UserEstablishedGraphqlConnectionInternalMsgHdlr extends HandlerHelpers {
  this: MeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleUserEstablishedGraphqlConnectionInternalMsg(msg: UserEstablishedGraphqlConnectionInternalMsg, state: MeetingState2x): MeetingState2x = {
    log.info("Received user established a graphql connection. msg={} meetingId={}", msg, liveMeeting.props.meetingProp.intId)

    for {
      regUser <- RegisteredUsers.findWithUserId(msg.userId, liveMeeting.registeredUsers)
    } yield {
      RegisteredUsers.updateUserConnectedToGraphql(liveMeeting.registeredUsers, regUser, graphqlConnected = true)
    }

    Users2x.findWithIntId(liveMeeting.users2x, msg.userId) match {
      case Some(connectingUser) =>
        var userNewState = connectingUser

        if (connectingUser.userLeftFlag.left) {
          log.info("Resetting flag that user left meeting. user {}", msg.userId)
          sendUserLeftFlagUpdatedEvtMsg(outGW, liveMeeting, msg.userId, leftFlag = false)
          for {
            userUpdated <- Users2x.resetUserLeftFlag(liveMeeting.users2x, msg.userId)
          } yield {
            userNewState = userUpdated
          }
        }

        //isMobile and clientType are set on join, but if it is a reconnection join is not necessary
        //so it need to be set here
        if (connectingUser.mobile != msg.isMobile) {
          userNewState = Users2x.setMobile(liveMeeting.users2x, userNewState)
          broadcastUserMobileChanged(userNewState, msg.isMobile)
        }

        if (connectingUser.clientType != msg.clientType) {
          userNewState = Users2x.setClientType(liveMeeting.users2x, userNewState, msg.clientType)
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
