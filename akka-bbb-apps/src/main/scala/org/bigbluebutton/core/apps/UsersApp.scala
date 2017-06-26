package org.bigbluebutton.core.apps

import org.bigbluebutton.common2.domain.UserVO
import org.bigbluebutton.common2.messages._
import org.bigbluebutton.common2.messages.users.{ PresenterAssignedEvtMsg, PresenterAssignedEvtMsgBody }
import org.bigbluebutton.core.api._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.GuestPolicy
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core2.message.handlers.users.UserLeavingHdlr

trait UsersApp extends UserLeavingHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def automaticallyAssignPresenter(): Unit = {
    log.debug("auto assigning presenter")

    Users2x.findModerator(liveMeeting.users2x) match {
      case Some(moderator) =>
        for {
          newPresenter <- Users2x.makePresenter(liveMeeting.users2x, moderator.intId)
        } yield {
          log.debug("sending assigned presenter for intId={} name={}", newPresenter.intId, newPresenter.name)
          sendPresenterAssigned(newPresenter.intId, newPresenter.name, newPresenter.name)
        }
      case None => log.debug("No moderator found.")
    }

    for {
      moderator <- Users2x.findModerator(liveMeeting.users2x)
      newPresenter <- Users2x.makePresenter(liveMeeting.users2x, moderator.intId)
    } yield {
      log.debug("sending assigned presenter for intId={} name={}", newPresenter.intId, newPresenter.name)
      sendPresenterAssigned(newPresenter.intId, newPresenter.name, newPresenter.name)
    }
  }

  def sendPresenterAssigned(intId: String, name: String, assignedBy: String): Unit = {
    def build(meetingId: String, intId: String, name: String, assignedBy: String): BbbCommonEnvCoreMsg = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, intId)
      val envelope = BbbCoreEnvelope(PresenterAssignedEvtMsg.NAME, routing)

      val body = PresenterAssignedEvtMsgBody(intId, name, assignedBy)
      val header = BbbClientMsgHeader(PresenterAssignedEvtMsg.NAME, meetingId, intId)
      val event = PresenterAssignedEvtMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }

    def event = build(props.meetingProp.intId, intId, name, assignedBy)
    outGW.send(event)
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
