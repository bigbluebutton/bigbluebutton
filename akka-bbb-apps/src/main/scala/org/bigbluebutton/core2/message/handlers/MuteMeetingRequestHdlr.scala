package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.common2.messages.VoiceConf.{ MuteUserInVoiceConfMsg, MuteUserInVoiceConfMsgBody }
import org.bigbluebutton.common2.messages._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.{ MeetingMuted, MuteMeetingRequest, MuteVoiceUser }
import org.bigbluebutton.core.models.{ Users1x, VoiceUserState, VoiceUsers }
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.MeetingStatus2x

trait MuteMeetingRequestHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleMuteMeetingRequest(msg: MuteMeetingRequest) {
    if (msg.mute) {
      MeetingStatus2x.muteMeeting(liveMeeting.status)
    } else {
      MeetingStatus2x.unmuteMeeting(liveMeeting.status)
    }

    outGW.send(new MeetingMuted(props.meetingProp.intId, props.recordProp.record,
      MeetingStatus2x.isMeetingMuted(liveMeeting.status)))

    Users1x.getUsers(liveMeeting.users) foreach { u =>
      outGW.send(new MuteVoiceUser(props.meetingProp.intId, props.recordProp.record, msg.requesterID,
        u.id, props.voiceProp.voiceConf, u.voiceUser.userId, msg.mute))
    }

    def muteUserInVoiceConf(vu: VoiceUserState): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId, vu.intId)
      val envelope = BbbCoreEnvelope(MuteUserInVoiceConfMsg.NAME, routing)
      val header = BbbCoreHeaderWithMeetingId(MuteUserInVoiceConfMsg.NAME, props.meetingProp.intId)

      val body = MuteUserInVoiceConfMsgBody(props.voiceProp.voiceConf, vu.voiceUserId, true)
      val event = MuteUserInVoiceConfMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      outGW.send(msgEvent)

    }

    VoiceUsers.findAll(liveMeeting.voiceUsers) foreach { vu =>
      if (!vu.listenOnly) {
        muteUserInVoiceConf(vu)
      }
    }
  }
}
