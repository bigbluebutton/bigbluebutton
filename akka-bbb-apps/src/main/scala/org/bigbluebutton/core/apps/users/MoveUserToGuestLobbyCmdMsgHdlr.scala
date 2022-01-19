package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.{ Sender, MsgBuilder }
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait MoveUserToGuestLobbyCmdMsgHdlr extends RightsManagementTrait {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleMoveUserToGuestLobbyCmdMsg(msg: MoveUserToGuestLobbyCmdMsg) {
    val meetingId = liveMeeting.props.meetingProp.intId

    if (permissionFailed(
      PermissionCheck.MOD_LEVEL,
      PermissionCheck.VIEWER_LEVEL,
      liveMeeting.users2x,
      msg.header.userId
    ) || liveMeeting.props.meetingProp.isBreakout) {
      val reason = "No permission to move user to guest lobby."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    } else {

      // remove from Users list
      for {
        user <- Users2x.ejectFromMeeting(liveMeeting.users2x, msg.body.userMovedToGuestLobbyId)
      } yield {

        //assign presenter
        if (user.presenter) {
          UsersApp.automaticallyAssignPresenter(outGW, liveMeeting)
        }
        UsersApp.sendEjectUserFromVoiceToFreeswitch(
          outGW,
          liveMeeting.props.meetingProp.intId,
          liveMeeting.props.voiceProp.voiceConf, user.intId
        )
      }

      // Eject user from the conference
      for {
        userMoved <- RegisteredUsers.findWithUserId(msg.body.userMovedToGuestLobbyId, liveMeeting.registeredUsers)
        movedByUser <- RegisteredUsers.findWithUserId(msg.body.movedToGuestLobbyBy, liveMeeting.registeredUsers)
      } yield {
        RegisteredUsers.setWaitingForApproval(liveMeeting.registeredUsers, userMoved, GuestStatus.WAIT)

        val reason = "Moved to guest lobby";
        UsersApp.sendUserEjectedMessageToClient(outGW, meetingId, userMoved.id, movedByUser.id, reason, EjectReasonCode.MOVED_TO_GUEST_LOBBY);
        UsersApp.sendUserLeftMeetingToAllClients(outGW, meetingId, userMoved.id)
        UsersApp.sendEjectUserFromSfuSysMsg(outGW, meetingId, userMoved.id)
        Sender.sendDisconnectClientSysMsg(meetingId, userMoved.id, movedByUser.id, EjectReasonCode.MOVED_TO_GUEST_LOBBY, outGW)
      }

      //Notify Moderator about new guest and register the user anew
      for {
        movedUser <- RegisteredUsers.findWithUserId(msg.body.userMovedToGuestLobbyId, liveMeeting.registeredUsers)
      } yield {
        val movedUserToRegister = MovedUserToGuestLobby(movedUser.id, movedUser.externId, movedUser.name,
          movedUser.role, movedUser.authToken, movedUser.avatarURL,
          true, movedUser.authed, GuestStatus.WAIT,
          movedUser.excludeFromDashboard, false)

        // When the moved user lands in the guest lobby with the same sessionToken, he should poll for its status.
        // The status value is stored in bbb-common-web.
        // If the user session, doesn't changes its status,
        // the guest user will be redirected directly depending on the previous response from moderator.
        val eventStatusChanged = MsgBuilder.buildStatusOfMovedUserChangedEvtMsg(meetingId, movedUser.id, GuestStatus.WAIT)
        outGW.send(eventStatusChanged)

        // The moved user should be registered anew,
        // since once he is ejected from the conference and moved to the guest lobby,
        // he is removed also from the data concerning the registered users.
        val eventRegisterUserAnew = MsgBuilder.buildRegisterMovedUserAnewEvtMsg(meetingId, movedUserToRegister);
        outGW.send(eventRegisterUserAnew)
      }
    }
  }
}
