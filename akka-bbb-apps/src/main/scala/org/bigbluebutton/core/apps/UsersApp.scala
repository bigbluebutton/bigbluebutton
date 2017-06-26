package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.common2.domain.UserVO

trait UsersApp {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleValidateAuthToken(msg: ValidateAuthToken) {
    log.info("Got ValidateAuthToken message. meetingId=" + msg.meetingID + " userId=" + msg.userId)
    RegisteredUsers.getRegisteredUserWithToken(msg.token, msg.userId, liveMeeting.registeredUsers) match {
      case Some(u) =>

        //send the reply
        outGW.send(new ValidateAuthTokenReply(props.meetingProp.intId, msg.userId, msg.token, true, msg.correlationId))

        log.info("ValidateToken success. meetingId=" + props.meetingProp.intId + " userId=" + msg.userId)

        //join the user
        handleUserJoin(new UserJoining(props.meetingProp.intId, msg.userId, msg.token))
      case None =>
        log.info("ValidateToken failed. meetingId=" + props.meetingProp.intId + " userId=" + msg.userId)
        outGW.send(new ValidateAuthTokenReply(props.meetingProp.intId, msg.userId, msg.token, false, msg.correlationId))
    }
  }

  def handleRegisterUser(msg: RegisterUser) {
    if (MeetingStatus2x.hasMeetingEnded(liveMeeting.status)) {
      // Check first if the meeting has ended and the user refreshed the client to re-connect.
      log.info("Register user failed. Mmeeting has ended. meetingId=" + props.meetingProp.intId + " userId=" + msg.userID)
      sendMeetingHasEnded(msg.userID)
    } else {
      val regUser = RegisteredUsers.create(msg.userID, msg.extUserID, msg.name, msg.role, msg.authToken,
        msg.avatarURL, msg.guest, msg.authed, msg.guest, liveMeeting.registeredUsers)

      log.info("Register user success. meetingId=" + props.meetingProp.intId + " userId=" + msg.userID + " user=" + regUser)
      outGW.send(new UserRegistered(props.meetingProp.intId, props.recordProp.record, regUser))
    }

  }

  def usersWhoAreNotPresenter(): Array[UserVO] = {
    Users.usersWhoAreNotPresenter(liveMeeting.users).toArray
  }

  def makeSurePresenterIsAssigned(user: UserVO): Unit = {
    if (user.presenter) {
      /* The current presenter has left the meeting. Find a moderator and make
       * him presenter. This way, if there is a moderator in the meeting, there
       * will always be a presenter.
       */
      val moderator = Users.findAModerator(liveMeeting.users)
      moderator.foreach { mod =>
        log.info("Presenter left meeting.  meetingId=" + props.meetingProp.intId + " userId=" + user.id
          + ". Making user=[" + mod.id + "] presenter.")
        assignNewPresenter(mod.id, mod.name, mod.id)
      }

      if (MeetingStatus2x.isBroadcastingRTMP(liveMeeting.status)) {
        // The presenter left during desktop sharing. Stop desktop sharing on FreeSWITCH
        outGW.send(new DeskShareHangUp(props.meetingProp.intId, props.voiceProp.voiceConf))

        // notify other clients to close their deskshare view
        outGW.send(new DeskShareNotifyViewersRTMP(props.meetingProp.intId,
          MeetingStatus2x.getRTMPBroadcastingUrl(liveMeeting.status),
          MeetingStatus2x.getDesktopShareVideoWidth(liveMeeting.status),
          MeetingStatus2x.getDesktopShareVideoHeight(liveMeeting.status), false))

        // reset meeting info
        MeetingStatus2x.resetDesktopSharingParams(liveMeeting.status)
      }
    }
  }

  def getInitialLockStatus(role: String): Boolean = {
    MeetingStatus2x.getPermissions(liveMeeting.status).lockOnJoin && !role.equals(Roles.MODERATOR_ROLE)
  }

  def stopRecordingVoiceConference() {
    if (Users.numUsersInVoiceConference(liveMeeting.users) == 0 &&
      props.recordProp.record &&
      MeetingStatus2x.isVoiceRecording(liveMeeting.status)) {
      MeetingStatus2x.stopRecordingVoice(liveMeeting.status)
      log.info("Send STOP RECORDING voice conf. meetingId=" + props.meetingProp.intId + " voice conf=" + props.voiceProp.voiceConf)
      outGW.send(new StopRecordingVoiceConf(props.meetingProp.intId, props.recordProp.record,
        props.voiceProp.voiceConf, MeetingStatus2x.getVoiceRecordingFilename(liveMeeting.status)))
    }
  }

  def handleUserLeftVoiceConfMessage(msg: UserLeftVoiceConfMessage) {
    log.info("Received user left voice conf. meetingId=" + props.meetingProp.intId + " voice conf=" + msg.voiceConfId
      + " userId=" + msg.voiceUserId)

    for {
      user <- Users.getUserWithVoiceUserId(msg.voiceUserId, liveMeeting.users)
      nu = Users.resetVoiceUser(user, liveMeeting.users)
    } yield {
      log.info("User left voice conf. meetingId=" + props.meetingProp.intId + " userId=" + nu.id + " user=" + nu)
      outGW.send(new UserLeftVoice(props.meetingProp.intId, props.recordProp.record, props.voiceProp.voiceConf, nu))

      if (user.phoneUser) {
        for {
          userLeaving <- Users.userLeft(user.id, liveMeeting.users)
        } yield {
          outGW.send(new UserLeft(props.meetingProp.intId, props.recordProp.record, userLeaving))
        }
      }
    }

    stopRecordingVoiceConference()

  }

  def handleUserMutedInVoiceConfMessage(msg: UserMutedInVoiceConfMessage) {
    for {
      user <- Users.getUserWithVoiceUserId(msg.voiceUserId, liveMeeting.users)
      nu = Users.setUserMuted(user, liveMeeting.users, msg.muted)
    } yield {
      log.info("User muted in voice conf. meetingId=" + props.meetingProp.intId + " userId=" + nu.id + " user=" + nu)

      outGW.send(new UserVoiceMuted(props.meetingProp.intId, props.recordProp.record, props.voiceProp.voiceConf, nu))
    }
  }

  def handleUserTalkingInVoiceConfMessage(msg: UserTalkingInVoiceConfMessage) {
    for {
      user <- Users.getUserWithVoiceUserId(msg.voiceUserId, liveMeeting.users)
      nv = Users.setUserTalking(user, liveMeeting.users, msg.talking)
    } yield {
      outGW.send(new UserVoiceTalking(props.meetingProp.intId, props.recordProp.record, props.voiceProp.voiceConf, nv))
    }
  }

  def handleAssignPresenter(msg: AssignPresenter): Unit = {
    assignNewPresenter(msg.newPresenterID, msg.newPresenterName, msg.assignedBy)
  }

  def assignNewPresenter(newPresenterID: String, newPresenterName: String, assignedBy: String) {
    // Stop poll if one is running as presenter left.
    handleStopPollRequest(StopPollRequest(props.meetingProp.intId, assignedBy))

    def removePresenterRightsToCurrentPresenter(): Unit = {
      for {
        curPres <- Users.getCurrentPresenter(liveMeeting.users)
      } yield {
        Users.unbecomePresenter(curPres.id, liveMeeting.users)
        outGW.send(new UserStatusChange(props.meetingProp.intId, props.recordProp.record, curPres.id, "presenter", false: java.lang.Boolean))
      }
    }

    for {
      newPres <- Users.findWithId(newPresenterID, liveMeeting.users)
    } yield {
      removePresenterRightsToCurrentPresenter()
      Users.becomePresenter(newPres.id, liveMeeting.users)
      MeetingStatus2x.setCurrentPresenterInfo(liveMeeting.status, new Presenter(newPresenterID, newPresenterName, assignedBy))
      outGW.send(new PresenterAssigned(props.meetingProp.intId, props.recordProp.record, new Presenter(newPresenterID, newPresenterName, assignedBy)))
      outGW.send(new UserStatusChange(props.meetingProp.intId, props.recordProp.record, newPresenterID, "presenter", true: java.lang.Boolean))
    }
  }

  def handleRespondToGuest(msg: RespondToGuest) {
    if (Users.isModerator(msg.requesterID, liveMeeting.users)) {
      var usersToAnswer: Array[UserVO] = null;
      if (msg.userId == null) {
        usersToAnswer = Users.getUsers(liveMeeting.users).filter(u => u.waitingForAcceptance == true).toArray
      } else {
        usersToAnswer = Users.getUsers(liveMeeting.users).filter(u => u.waitingForAcceptance == true && u.id == msg.userId).toArray
      }
      usersToAnswer foreach { user =>
        println("UsersApp - handleGuestAccessDenied for user [" + user.id + "]");
        if (msg.response == true) {
          val nu = Users.setWaitingForAcceptance(user, liveMeeting.users, false)
          RegisteredUsers.updateRegUser(nu, liveMeeting.registeredUsers)
          outGW.send(new UserJoined(props.meetingProp.intId, props.recordProp.record, nu))
        } else {
          outGW.send(new GuestAccessDenied(props.meetingProp.intId, props.recordProp.record, user.id))
        }
      }
    }
  }
}
