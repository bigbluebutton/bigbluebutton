package org.bigbluebutton

import org.bigbluebutton.common2.msgs.{ BbbCommonEnvCoreMsg, BbbCoreEnvelope, BbbCoreHeaderWithMeetingId, MessageTypes, MuteUserInVoiceConfSysMsg, MuteUserInVoiceConfSysMsgBody, Routing }
import org.bigbluebutton.core.models.{ Roles, Users2x, VoiceUserState, VoiceUsers }
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.{ MeetingStatus2x }

object LockSettingsUtil {

  private def muteUserInVoiceConf(liveMeeting: LiveMeeting, outGW: OutMsgRouter, vu: VoiceUserState, mute: Boolean): Unit = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, vu.intId)
    val envelope = BbbCoreEnvelope(MuteUserInVoiceConfSysMsg.NAME, routing)
    val header = BbbCoreHeaderWithMeetingId(MuteUserInVoiceConfSysMsg.NAME, liveMeeting.props.meetingProp.intId)

    val body = MuteUserInVoiceConfSysMsgBody(liveMeeting.props.voiceProp.voiceConf, vu.voiceUserId, mute)
    val event = MuteUserInVoiceConfSysMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

    outGW.send(msgEvent)
  }

  private def applyMutingOfUsers(disableMic: Boolean, liveMeeting: LiveMeeting, outGW: OutMsgRouter): Unit = {
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

  def enforceLockSettingsForAllVoiceUsers(liveMeeting: LiveMeeting, outGW: OutMsgRouter): Unit = {
    val permissions = MeetingStatus2x.getPermissions(liveMeeting.status)
    applyMutingOfUsers(permissions.disableMic, liveMeeting, outGW)
  }

  def enforceLockSettingsForVoiceUser(voiceUser: VoiceUserState, liveMeeting: LiveMeeting, outGW: OutMsgRouter): Unit = {
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

  private def enforceListenOnlyUserIsMuted(intUserId: String, liveMeeting: LiveMeeting, outGW: OutMsgRouter): Unit = {
    val voiceUser = VoiceUsers.findWithIntId(liveMeeting.voiceUsers, intUserId)
    voiceUser.foreach { vu =>
      // Make sure that listen only user is muted. (ralam dec 6, 2019
      if (vu.listenOnly && !vu.muted) {
        muteUserInVoiceConf(liveMeeting, outGW, vu, true)
      }
    }
  }
}
