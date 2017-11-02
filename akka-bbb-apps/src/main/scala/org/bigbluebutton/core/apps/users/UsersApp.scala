package org.bigbluebutton.core.apps.users

import akka.actor.ActorContext
import akka.event.Logging
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.InternalEventBus
import org.bigbluebutton.core.models.{ Roles, Users2x }
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }

object UsersApp {
  def broadcastAddUserToPresenterGroup(meetingId: String, userId: String, requesterId: String,
                                       outGW: OutMsgRouter): Unit = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
    val envelope = BbbCoreEnvelope(UserAddedToPresenterGroupEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(UserAddedToPresenterGroupEvtMsg.NAME, meetingId, userId)
    val body = UserAddedToPresenterGroupEvtMsgBody(userId, requesterId)
    val event = UserAddedToPresenterGroupEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

    outGW.send(msgEvent)
  }

  def addUserToPresenterGroup(liveMeeting: LiveMeeting, outGW: OutMsgRouter,
                              userId: String, requesterId: String): Unit = {
    Users2x.addUserToPresenterGroup(liveMeeting.users2x, userId)
    UsersApp.broadcastAddUserToPresenterGroup(
      liveMeeting.props.meetingProp.intId,
      userId, requesterId, outGW
    )
  }

}

class UsersApp(
  val liveMeeting: LiveMeeting,
  val outGW:       OutMsgRouter,
  val eventBus:    InternalEventBus
)(implicit val context: ActorContext)

    extends ValidateAuthTokenReqMsgHdlr
    with GetUsersMeetingReqMsgHdlr
    with RegisterUserReqMsgHdlr
    with ChangeUserRoleCmdMsgHdlr
    with SyncGetUsersMeetingRespMsgHdlr
    with LogoutAndEndMeetingCmdMsgHdlr
    with MeetingActivityResponseCmdMsgHdlr
    with SetRecordingStatusCmdMsgHdlr
    with GetRecordingStatusReqMsgHdlr
    with AssignPresenterReqMsgHdlr
    with AddUserToPresenterGroupCmdMsgHdlr
    with RemoveUserFromPresenterGroupCmdMsgHdlr
    with GetPresenterGroupReqMsgHdlr
    with EjectUserFromMeetingCmdMsgHdlr
    with MuteUserCmdMsgHdlr
    with MuteUserCmdMsgHdlrPermCheck {

  val log = Logging(context.system, getClass)
}
