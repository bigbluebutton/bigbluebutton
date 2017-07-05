package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.StartRecordingVoiceConf
import org.bigbluebutton.core.models.{ VoiceUser2x, VoiceUserState, VoiceUsers }
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.MeetingStatus2x

trait UserJoinedVoiceConfEvtMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleUserJoinedVoiceConfEvtMsg(msg: UserJoinedVoiceConfEvtMsg): Unit = {
    log.warning("Received user joined voice conference " + msg)

    def broadcastEvent(voiceUserState: VoiceUserState): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId, voiceUserState.intId)
      val envelope = BbbCoreEnvelope(UserJoinedVoiceConfToClientEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(UserJoinedVoiceConfToClientEvtMsg.NAME, props.meetingProp.intId, voiceUserState.intId)

      val body = UserJoinedVoiceConfToClientEvtMsgBody(intId = voiceUserState.intId, voiceUserId = voiceUserState.voiceUserId,
        callerName = voiceUserState.callerName, callerNum = voiceUserState.callerNum, muted = voiceUserState.muted,
        talking = voiceUserState.talking, callingWith = voiceUserState.callingWith, listenOnly = voiceUserState.listenOnly)

      val event = UserJoinedVoiceConfToClientEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)

      record(event)
    }

    val voiceUser = VoiceUser2x(msg.body.intId, msg.body.voiceUserId)
    val voiceUserState = VoiceUserState(intId = msg.body.intId, voiceUserId = msg.body.voiceUserId,
      callingWith = msg.body.callingWith, callerName = msg.body.callerIdName, callerNum = msg.body.callerIdNum,
      muted = msg.body.muted, talking = msg.body.talking, listenOnly = false)

    VoiceUsers.add(liveMeeting.voiceUsers, voiceUserState)

    broadcastEvent(voiceUserState)

    startRecordingVoiceConference()
  }

  def startRecordingVoiceConference() {
    if (VoiceUsers.findAll(liveMeeting.voiceUsers) == 1 &&
      props.recordProp.record &&
      !MeetingStatus2x.isVoiceRecording(liveMeeting.status)) {
      MeetingStatus2x.startRecordingVoice(liveMeeting.status)
      log.info("Send START RECORDING voice conf. meetingId=" + props.meetingProp.intId + " voice conf=" + props.voiceProp.voiceConf)
      outGW.send(new StartRecordingVoiceConf(props.meetingProp.intId, props.recordProp.record, props.voiceProp.voiceConf))
    }
  }
}
