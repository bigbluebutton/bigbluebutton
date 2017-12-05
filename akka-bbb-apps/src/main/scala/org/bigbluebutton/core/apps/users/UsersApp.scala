package org.bigbluebutton.core.apps.users

import akka.actor.ActorContext
import akka.event.Logging
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.InternalEventBus
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.{ MsgBuilder, Sender }

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

  def automaticallyAssignPresenter(outGW: OutMsgRouter, liveMeeting: LiveMeeting): Unit = {
    val meetingId = liveMeeting.props.meetingProp.intId
    for {
      moderator <- Users2x.findModerator(liveMeeting.users2x)
      newPresenter <- Users2x.makePresenter(liveMeeting.users2x, moderator.intId)
    } yield {
      sendPresenterAssigned(outGW, meetingId, newPresenter.intId, newPresenter.name, newPresenter.intId)
    }
  }

  def sendPresenterAssigned(outGW: OutMsgRouter, meetingId: String, intId: String, name: String, assignedBy: String): Unit = {
    def event = MsgBuilder.buildPresenterAssignedEvtMsg(meetingId, intId, name, assignedBy)
    outGW.send(event)
  }

  def sendUserEjectedMessageToClient(outGW: OutMsgRouter, meetingId: String,
                                     userId: String, ejectedBy: String, reason: String): Unit = {
    // send a message to client
    Sender.sendUserEjectedFromMeetingClientEvtMsg(
      meetingId,
      userId, ejectedBy, reason, outGW
    )
  }

  def sendUserLeftMeetingToAllClients(outGW: OutMsgRouter, meetingId: String,
                                      userId: String): Unit = {
    // send a user left event for the clients to update
    val userLeftMeetingEvent = MsgBuilder.buildUserLeftMeetingEvtMsg(meetingId, userId)
    outGW.send(userLeftMeetingEvent)
  }

  def sendEjectUserFromVoiceToFreeswitch(
    outGW:       OutMsgRouter,
    meetingId:   String,
    voiceConf:   String,
    voiceUserId: String
  ): Unit = {
    val ejectFromVoiceEvent = MsgBuilder.buildEjectUserFromVoiceConfSysMsg(
      meetingId,
      voiceConf,
      voiceUserId
    )
    outGW.send(ejectFromVoiceEvent)
  }

  def ejectUserFromMeeting(outGW: OutMsgRouter, liveMeeting: LiveMeeting,
                           userId: String, ejectedBy: String, reason: String): Unit = {

    val meetingId = liveMeeting.props.meetingProp.intId

    for {
      user <- Users2x.ejectFromMeeting(liveMeeting.users2x, userId)
    } yield {
      RegisteredUsers.remove(userId, liveMeeting.registeredUsers)
      sendUserEjectedMessageToClient(outGW, meetingId, userId, ejectedBy, reason)
      sendUserLeftMeetingToAllClients(outGW, meetingId, userId)
      if (user.presenter) {
        automaticallyAssignPresenter(outGW, liveMeeting)
      }
    }

    for {
      vu <- VoiceUsers.findWithIntId(liveMeeting.voiceUsers, userId)
    } yield {
      sendEjectUserFromVoiceToFreeswitch(
        outGW,
        liveMeeting.props.meetingProp.intId,
        liveMeeting.props.voiceProp.voiceConf, vu.voiceUserId
      )
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
    with MuteUserCmdMsgHdlr {

  val log = Logging(context.system, getClass)
}
