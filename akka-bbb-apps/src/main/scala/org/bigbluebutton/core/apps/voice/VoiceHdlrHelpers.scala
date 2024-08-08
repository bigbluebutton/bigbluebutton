package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.{ Users2x, VoiceUsers }
import org.bigbluebutton.core.running.{ LiveMeeting }
import org.bigbluebutton.LockSettingsUtil
import org.bigbluebutton.SystemConfiguration

object VoiceHdlrHelpers extends SystemConfiguration {
  def isGlobalAudioSubscribeAllowed(
      liveMeeting: LiveMeeting,
      meetingId:   String,
      userId:      String,
      voiceConf:   String
  ): Boolean = {
    Users2x.findWithIntId(liveMeeting.users2x, userId) match {
      case Some(user) => (
        applyPermissionCheck &&
        liveMeeting.props.meetingProp.intId == meetingId &&
        liveMeeting.props.voiceProp.voiceConf == voiceConf
      )
      case _ => false
    }
  }

  def isMicrophoneSharingAllowed(
      liveMeeting: LiveMeeting,
      meetingId:   String,
      userId:      String,
      voiceConf:   String,
      callerIdNum: String
  ): Boolean = {
    Users2x.findWithIntId(liveMeeting.users2x, userId) match {
      case Some(user) => {
        val isCallerBanned = VoiceUsers.isCallerBanned(
          callerIdNum,
          liveMeeting.voiceUsers
        )

        (applyPermissionCheck &&
          !isCallerBanned &&
          liveMeeting.props.meetingProp.intId == meetingId &&
          liveMeeting.props.voiceProp.voiceConf == voiceConf)
      }
      case _ => false
    }
  }

  def isMicrophoneSharingLocked(
      liveMeeting: LiveMeeting,
      userId:      String
  ): Boolean = {
    Users2x.findWithIntId(liveMeeting.users2x, userId) match {
      case Some(user) => LockSettingsUtil.isMicrophoneSharingLocked(
        user,
        liveMeeting
      ) && applyPermissionCheck
      case _ => false
    }
  }

  def transparentListenOnlyAllowed(liveMeeting: LiveMeeting): Boolean = {
    // Transparent listen only meeting-wide activation threshold.
    // Threshold is the number of muted duplex audio channels in a meeting.
    // 0 means no threshold, all users are subject to it
    val mutedDuplexChannels = VoiceUsers.findAllMutedVoiceUsers(liveMeeting.voiceUsers).length
    val threshold = transparentListenOnlyThreshold

    (threshold == 0) || (mutedDuplexChannels >= threshold)
  }

  def muteOnStartThresholdReached(liveMeeting: LiveMeeting): Boolean = {
    // Mute on start meeting-wide activation threshold.
    // Threshold is the number of users in voice.
    // muteOnStartThreshold = 0 means no threshold (disabled).
    val usersInVoiceConf = VoiceUsers.usersInVoiceConf(liveMeeting.voiceUsers)

    muteOnStartThreshold > 0 && usersInVoiceConf >= muteOnStartThreshold
  }
}
