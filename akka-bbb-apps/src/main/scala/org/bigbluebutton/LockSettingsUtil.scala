package org.bigbluebutton

import org.apache.pekko.actor.ActorContext

import org.bigbluebutton.common2.msgs.{ BbbCommonEnvCoreMsg, BbbCoreEnvelope, BbbCoreHeaderWithMeetingId, MessageTypes, Routing }
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.{ MeetingStatus2x }
import org.bigbluebutton.core.apps.webcam.CameraHdlrHelpers
import org.bigbluebutton.core.apps.voice.VoiceApp
import org.bigbluebutton.core.models.{
  Roles,
  Users2x,
  UserState,
  VoiceUserState,
  VoiceUsers,
  Webcams,
  WebcamStream
}

object LockSettingsUtil {

  private def muteUserInVoiceConf(
      liveMeeting: LiveMeeting,
      outGW:       OutMsgRouter,
      vu:          VoiceUserState, mute: Boolean
  )(implicit context: ActorContext): Unit = {
    VoiceApp.muteUserInVoiceConf(liveMeeting, outGW, vu.intId, mute)
  }

  private def applyMutingOfUsers(
      disableMic:  Boolean,
      liveMeeting: LiveMeeting,
      outGW:       OutMsgRouter
  )(implicit context: ActorContext): Unit = {
    VoiceUsers.findAll(liveMeeting.voiceUsers) foreach { vu =>
      Users2x.findWithIntId(liveMeeting.users2x, vu.intId).foreach { user =>
        if (user.role == Roles.VIEWER_ROLE && !vu.listenOnly && user.locked) {
          // Apply lock setting to users who are not listen only. (ralam dec 6, 2019)
          muteUserInVoiceConf(liveMeeting, outGW, vu, disableMic)
        }

        // Make sure listen only users are muted. (ralam dec 6, 2019)
        if (vu.listenOnly && !vu.muted) {
          muteUserInVoiceConf(liveMeeting, outGW, vu, true)
        }
      }
    }
  }

  def enforceLockSettingsForAllVoiceUsers(
      liveMeeting: LiveMeeting,
      outGW:       OutMsgRouter
  )(implicit context: ActorContext): Unit = {
    val permissions = MeetingStatus2x.getPermissions(liveMeeting.status)
    applyMutingOfUsers(permissions.disableMic, liveMeeting, outGW)
  }

  def enforceLockSettingsForVoiceUser(
      voiceUser:   VoiceUserState,
      liveMeeting: LiveMeeting,
      outGW:       OutMsgRouter
  )(implicit context: ActorContext): Unit = {

    val permissions = MeetingStatus2x.getPermissions(liveMeeting.status)
    if (permissions.disableMic) {
      Users2x.findWithIntId(liveMeeting.users2x, voiceUser.intId).foreach { user =>
        if (user.role == Roles.VIEWER_ROLE && user.locked) {
          // Make sure that user is muted when lock settings has mic disabled. (ralam dec 6, 2019
          if (!voiceUser.muted) {
            muteUserInVoiceConf(liveMeeting, outGW, voiceUser, true)
          }
        }
      }
    } else {
      enforceListenOnlyUserIsMuted(voiceUser.intId, liveMeeting, outGW)
    }
  }

  private def enforceListenOnlyUserIsMuted(
      intUserId:   String,
      liveMeeting: LiveMeeting,
      outGW:       OutMsgRouter
  )(implicit context: ActorContext): Unit = {
    val voiceUser = VoiceUsers.findWithIntId(liveMeeting.voiceUsers, intUserId)
    voiceUser.foreach { vu =>
      // Make sure that listen only user is muted. (ralam dec 6, 2019
      if (vu.listenOnly && !vu.muted) {
        muteUserInVoiceConf(liveMeeting, outGW, vu, true)
      }
    }
  }

  def isMicrophoneSharingLocked(user: UserState, liveMeeting: LiveMeeting): Boolean = {
    val permissions = MeetingStatus2x.getPermissions(liveMeeting.status)

    user.role == Roles.VIEWER_ROLE && user.locked && permissions.disableMic
  }

  def isCameraBroadcastLocked(user: UserState, liveMeeting: LiveMeeting): Boolean = {
    val permissions = MeetingStatus2x.getPermissions(liveMeeting.status)

    user.role == Roles.VIEWER_ROLE && user.locked && permissions.disableCam
  }

  def isCameraSubscribeLocked(
      user: UserState, stream: WebcamStream, liveMeeting: LiveMeeting
  ): Boolean = {
    var locked = false

    for {
      publisher <- Users2x.findWithIntId(liveMeeting.users2x, stream.userId)
    } yield {
      if (MeetingStatus2x.webcamsOnlyForModeratorEnabled(liveMeeting.status)
        && publisher.role != Roles.MODERATOR_ROLE
        && user.role == Roles.VIEWER_ROLE
        && user.locked) {
        locked = true
      }
    }

    locked
  }

  private def enforceSeeOtherViewersForUser(
      user: UserState, liveMeeting: LiveMeeting, outGW: OutMsgRouter
  ): Unit = {
    if (MeetingStatus2x.webcamsOnlyForModeratorEnabled(liveMeeting.status)) {
      Webcams.findAll(liveMeeting.webcams) foreach { webcam =>

        if (isCameraSubscribeLocked(user, webcam, liveMeeting)
          && Webcams.isSubscriber(liveMeeting.webcams, user.intId, webcam.streamId)) {
          CameraHdlrHelpers.requestCamSubscriptionEjection(
            liveMeeting.props.meetingProp.intId,
            user.intId,
            webcam.streamId,
            outGW
          )
        }
      }
    }
  }

  private def enforceDisableCamForUser(
      user: UserState, liveMeeting: LiveMeeting, outGW: OutMsgRouter
  ): Unit = {
    if (isCameraBroadcastLocked(user, liveMeeting)) {
      val broadcastedWebcams = Webcams.findWebcamsForUser(liveMeeting.webcams, user.intId)
      broadcastedWebcams foreach { webcam =>
        CameraHdlrHelpers.requestBroadcastedCamEjection(
          liveMeeting.props.meetingProp.intId,
          user.intId,
          webcam.streamId,
          outGW
        )
      }
    }
  }

  def enforceCamLockSettingsForUser(
      user: UserState, liveMeeting: LiveMeeting, outGW: OutMsgRouter
  ): Unit = {
    enforceDisableCamForUser(user, liveMeeting, outGW)
    enforceSeeOtherViewersForUser(user, liveMeeting, outGW)
  }

  def enforceCamLockSettingsForAllUsers(liveMeeting: LiveMeeting, outGW: OutMsgRouter): Unit = {
    Users2x.findLockedViewers(liveMeeting.users2x).foreach { user =>
      enforceCamLockSettingsForUser(user, liveMeeting, outGW)
    }
  }
}
