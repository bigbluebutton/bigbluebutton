package org.bigbluebutton.core.apps.users

import org.apache.pekko.actor.ActorContext
import org.apache.pekko.event.Logging
import org.bigbluebutton.Boot.eventBus
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.api.SetPresenterInDefaultPodInternalMsg
import org.bigbluebutton.core.apps.ExternalVideoModel
import org.bigbluebutton.core.bus.{BigBlueButtonEvent, InternalEventBus}
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.{LiveMeeting, OutMsgRouter}
import org.bigbluebutton.core2.message.senders.{MsgBuilder, Sender}
import org.bigbluebutton.core.apps.screenshare.ScreenshareApp2x
import org.bigbluebutton.core.db.UserStateDAO

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

  def guestWaitingLeft(liveMeeting: LiveMeeting, userId: String, outGW: OutMsgRouter): Unit = {
    for {
      u <- RegisteredUsers.findWithUserId(userId, liveMeeting.registeredUsers)
    } yield {

      RegisteredUsers.eject(u.id, liveMeeting.registeredUsers, ban = false)

      val event = MsgBuilder.buildGuestWaitingLeftEvtMsg(liveMeeting.props.meetingProp.intId, u.id)
      outGW.send(event)
    }
  }

  def approveOrRejectGuest(liveMeeting: LiveMeeting, outGW: OutMsgRouter,
                           guest: GuestApprovedVO, approvedBy: String): Unit = {
    for {
      u <- RegisteredUsers.findWithUserId(guest.guest, liveMeeting.registeredUsers)
    } yield {
      RegisteredUsers.setWaitingForApproval(liveMeeting.registeredUsers, u, guest.status)
      UserStateDAO.updateGuestStatus(liveMeeting.props.meetingProp.intId, guest.guest, guest.status, approvedBy)
      // send message to user that he has been approved

      val event = MsgBuilder.buildGuestApprovedEvtMsg(
        liveMeeting.props.meetingProp.intId,
        guest.guest, guest.status, approvedBy
      )

      outGW.send(event)

    }
  }

  def automaticallyAssignPresenter(outGW: OutMsgRouter, liveMeeting: LiveMeeting): Unit = {
    // Stop external video if it's running
    ExternalVideoModel.stop(outGW, liveMeeting)
    // Request a screen broadcast stop (goes to SFU, comes back through
    // ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsg)
    ScreenshareApp2x.requestBroadcastStop(outGW, liveMeeting)

    val meetingId = liveMeeting.props.meetingProp.intId
    for {
      moderator <- Users2x.findModerator(liveMeeting.users2x)
      newPresenter <- Users2x.makePresenter(liveMeeting.users2x, moderator.intId)
    } yield {
      sendPresenterAssigned(outGW, meetingId, newPresenter.intId, newPresenter.name, newPresenter.intId)
      sendPresenterInPodReq(meetingId, newPresenter.intId)

      // Force reconnection with graphql to refresh permissions
      for {
        regUser <- RegisteredUsers.findWithUserId(newPresenter.intId, liveMeeting.registeredUsers)
      } yield {
        Sender.sendForceUserGraphqlReconnectionSysMsg(liveMeeting.props.meetingProp.intId, regUser.id, regUser.sessionToken, "role_changed", outGW)
      }
    }
  }

  def sendPresenterAssigned(outGW: OutMsgRouter, meetingId: String, intId: String, name: String, assignedBy: String): Unit = {
    def event = MsgBuilder.buildPresenterAssignedEvtMsg(meetingId, intId, name, assignedBy)
    outGW.send(event)
  }

  def sendPresenterInPodReq(meetingId: String, newPresenterIntId: String): Unit = {
    eventBus.publish(BigBlueButtonEvent(meetingId, SetPresenterInDefaultPodInternalMsg(newPresenterIntId)))
  }

  def sendUserLeftMeetingToAllClients(outGW: OutMsgRouter, meetingId: String,
                                      userId: String, eject: Boolean = false, ejectedBy: String = "", reason: String = "",  reasonCode: String = ""): Unit = {
    // send a user left event for the clients to update
    val userLeftMeetingEvent = MsgBuilder.buildUserLeftMeetingEvtMsg(meetingId, userId, eject, ejectedBy, reason, reasonCode)
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

  def sendEjectUserFromSfuSysMsg(
    outGW: OutMsgRouter,
    meetingId: String,
    userId: String
  ): Unit = {
    val event = MsgBuilder.buildEjectUserFromSfuSysMsg(
      meetingId,
      userId,
    )
    outGW.send(event)
  }

  def ejectUserFromMeeting(outGW: OutMsgRouter, liveMeeting: LiveMeeting,
                           userId: String, ejectedBy: String, reason: String,
                           reasonCode: String, ban: Boolean): Unit = {

    val meetingId = liveMeeting.props.meetingProp.intId
    RegisteredUsers.eject(userId, liveMeeting.registeredUsers, ban)
    for {
      user <- Users2x.ejectFromMeeting(liveMeeting.users2x, userId)
    } yield {
      sendUserLeftMeetingToAllClients(outGW, meetingId, userId, true, ejectedBy, reason, reasonCode)
      sendEjectUserFromSfuSysMsg(outGW, meetingId, userId)
      if (user.presenter) {
        // println(s"ejectUserFromMeeting will cause a automaticallyAssignPresenter for user=${user}")
        automaticallyAssignPresenter(outGW, liveMeeting)
      }
      UserStateDAO.updateEjected(meetingId, userId, reason, reasonCode, ejectedBy)
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

  extends RegisterUserReqMsgHdlr
  with RegisterUserSessionTokenReqMsgHdlr
  with GetUserApiMsgHdlr
  with ChangeUserRoleCmdMsgHdlr
  with SetUserSpeechLocaleMsgHdlr
  with SetUserCaptionLocaleMsgHdlr
  with SetUserClientSettingsReqMsgHdlr
  with SetUserEchoTestRunningReqMsgHdlr
  with SetUserSpeechOptionsMsgHdlr
  with LogoutAndEndMeetingCmdMsgHdlr
  with SetRecordingStatusCmdMsgHdlr
  with RecordAndClearPreviousMarkersCmdMsgHdlr
  with GetRecordingStatusReqMsgHdlr
  with AssignPresenterReqMsgHdlr
  with ChangeUserPinStateReqMsgHdlr
  with UserConnectionAliveReqMsgHdlr
  with ChangeUserReactionEmojiReqMsgHdlr
  with ChangeUserRaiseHandReqMsgHdlr
  with ChangeUserAwayReqMsgHdlr
  with EjectUserFromMeetingCmdMsgHdlr
  with EjectUserFromMeetingSysMsgHdlr
  with MuteUserCmdMsgHdlr {

  val log = Logging(context.system, getClass)
}
