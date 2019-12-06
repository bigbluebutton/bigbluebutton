package org.bigbluebutton

import org.bigbluebutton.common2.msgs.{ BbbCommonEnvCoreMsg, BbbCoreEnvelope, BbbCoreHeaderWithMeetingId, MessageTypes, MuteUserInVoiceConfSysMsg, MuteUserInVoiceConfSysMsgBody, Routing }
import org.bigbluebutton.core.models.{ Roles, Users2x, VoiceUserState, VoiceUsers }
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.{ MeetingStatus2x }

object LockSettingsUtil {

  def applyMutingOfUsers(mute: Boolean, liveMeeting: LiveMeeting, outGW: OutMsgRouter): Unit = {

    def muteUserInVoiceConf(vu: VoiceUserState, mute: Boolean): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, vu.intId)
      val envelope = BbbCoreEnvelope(MuteUserInVoiceConfSysMsg.NAME, routing)
      val header = BbbCoreHeaderWithMeetingId(MuteUserInVoiceConfSysMsg.NAME, liveMeeting.props.meetingProp.intId)

      val body = MuteUserInVoiceConfSysMsgBody(liveMeeting.props.voiceProp.voiceConf, vu.voiceUserId, mute)
      val event = MuteUserInVoiceConfSysMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      outGW.send(msgEvent)
    }

    VoiceUsers.findAll(liveMeeting.voiceUsers) foreach { vu =>
      Users2x.findWithIntId(liveMeeting.users2x, vu.intId).foreach { user =>
        if (user.role == Roles.VIEWER_ROLE) {
          if (mute) {
            // Mute everyone. We also mute listenOnly users as sledgehammer to make sure
            // audio can't be transmitted. (ralam dec 6, 2019)
            muteUserInVoiceConf(vu, mute)
          } else {
            // Only unmute viewers and non-listenOnly users.
            if (!vu.listenOnly) {
              muteUserInVoiceConf(vu, mute)
            }
          }
        }
      }
    }
  }

  def enforceLockSettingsForVoice(liveMeeting: LiveMeeting, outGW: OutMsgRouter): Unit = {
    val permissions = MeetingStatus2x.getPermissions(liveMeeting.status)
    applyMutingOfUsers(permissions.disableMic, liveMeeting, outGW)

  }
}
