package org.bigbluebutton.core.apps.users

import akka.actor.ActorContext
import akka.event.Logging
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.InternalEventBus
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.MsgBuilder

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

  def approveOrRejectGuest(liveMeeting: LiveMeeting, outGW: OutMsgRouter,
                           guest: GuestApprovedVO, approvedBy: String): Unit = {
    for {
      u <- RegisteredUsers.findWithUserId(guest.guest, liveMeeting.registeredUsers)
    } yield {

      RegisteredUsers.setWaitingForApproval(liveMeeting.registeredUsers, u, guest.status)
      // send message to user that he has been approved

      val event = MsgBuilder.buildGuestApprovedEvtMsg(
        liveMeeting.props.meetingProp.intId,
        guest.guest, guest.status, approvedBy
      )

      outGW.send(event)

    }
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
