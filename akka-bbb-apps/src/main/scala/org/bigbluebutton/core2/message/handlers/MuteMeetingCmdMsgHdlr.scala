package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models.{ VoiceUserState, VoiceUsers }
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core2.MeetingStatus2x

trait MuteMeetingCmdMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleMuteMeetingCmdMsg(msg: MuteMeetingCmdMsg) {

    def build(meetingId: String, userId: String, muted: Boolean, mutedBy: String): BbbCommonEnvCoreMsg = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
      val envelope = BbbCoreEnvelope(MeetingMutedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(MeetingMutedEvtMsg.NAME, meetingId, userId)

      val body = MeetingMutedEvtMsgBody(muted, mutedBy)
      val event = MeetingMutedEvtMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }

    def muteUserInVoiceConf(vu: VoiceUserState, mute: Boolean): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId, vu.intId)
      val envelope = BbbCoreEnvelope(MuteUserInVoiceConfSysMsg.NAME, routing)
      val header = BbbCoreHeaderWithMeetingId(MuteUserInVoiceConfSysMsg.NAME, props.meetingProp.intId)

      val body = MuteUserInVoiceConfSysMsgBody(props.voiceProp.voiceConf, vu.voiceUserId, mute)
      val event = MuteUserInVoiceConfSysMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      outGW.send(msgEvent)

    }

    if (msg.body.mute != MeetingStatus2x.isMeetingMuted(liveMeeting.status)) {
      if (msg.body.mute) {
        MeetingStatus2x.muteMeeting(liveMeeting.status)
      } else {
        MeetingStatus2x.unmuteMeeting(liveMeeting.status)
      }

      val muted = MeetingStatus2x.isMeetingMuted(liveMeeting.status)
      val meetingMutedEvent = build(props.meetingProp.intId, msg.body.mutedBy, muted, msg.body.mutedBy)

      outGW.send(meetingMutedEvent)

      VoiceUsers.findAll(liveMeeting.voiceUsers) foreach { vu =>
        if (!vu.listenOnly) {
          muteUserInVoiceConf(vu, muted)
        }
      }
    }
  }
}
