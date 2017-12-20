package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.breakout.BreakoutHdlrHelpers
import org.bigbluebutton.core.models.{ VoiceUserState, VoiceUsers }
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait UserJoinedVoiceConfEvtMsgHdlr extends BreakoutHdlrHelpers {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleUserJoinedVoiceConfEvtMsg(msg: UserJoinedVoiceConfEvtMsg): Unit = {
    log.info("Received user joined voice conference " + msg)

    handleUserJoinedVoiceConfEvtMsg(msg.body.voiceConf, msg.body.intId, msg.body.voiceUserId,
      msg.body.callingWith, msg.body.callerIdName, msg.body.callerIdNum, msg.body.muted, msg.body.talking)
  }

  def handleUserJoinedVoiceConfEvtMsg(voiceConf: String, intId: String, voiceUserId: String, callingWith: String,
                                      callerIdName: String, callerIdNum: String, muted: Boolean, talking: Boolean): Unit = {
    def broadcastEvent(voiceUserState: VoiceUserState): Unit = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId, voiceUserState.intId)
      val envelope = BbbCoreEnvelope(UserJoinedVoiceConfToClientEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(
        UserJoinedVoiceConfToClientEvtMsg.NAME,
        liveMeeting.props.meetingProp.intId, voiceUserState.intId)

      val body = UserJoinedVoiceConfToClientEvtMsgBody(voiceConf, voiceUserState.intId, voiceUserState.voiceUserId,
        voiceUserState.callerName, voiceUserState.callerNum, voiceUserState.muted, voiceUserState.talking,
        voiceUserState.callingWith, voiceUserState.listenOnly)

      val event = UserJoinedVoiceConfToClientEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    val isListenOnly = if (callerIdName.startsWith("LISTENONLY")) true else false

    val voiceUserState = VoiceUserState(intId, voiceUserId, callingWith, callerIdName, callerIdNum, muted, talking, listenOnly = isListenOnly)
    VoiceUsers.add(liveMeeting.voiceUsers, voiceUserState)

    if (MeetingStatus2x.isMeetingMuted(liveMeeting.status) || muted) {
      val event = MsgBuilder.buildMuteUserInVoiceConfSysMsg(liveMeeting.props.meetingProp.intId, liveMeeting.props.voiceProp.voiceConf,
        voiceUserId, true)
      outGW.send(event)
    }

    broadcastEvent(voiceUserState)

    if (liveMeeting.props.meetingProp.isBreakout) {
      updateParentMeetingWithUsers()
    }

    startRecordingVoiceConference()
  }

  def startRecordingVoiceConference() {
    val numVoiceUsers = VoiceUsers.findAllNonListenOnlyVoiceUsers(liveMeeting.voiceUsers).length
    if (numVoiceUsers == 1 &&
      liveMeeting.props.recordProp.record &&
      !MeetingStatus2x.isVoiceRecording(liveMeeting.status)) {
      MeetingStatus2x.startRecordingVoice(liveMeeting.status)
      log.info("Send START RECORDING voice conf. meetingId=" + liveMeeting.props.meetingProp.intId
        + " voice conf=" + liveMeeting.props.voiceProp.voiceConf)

      val event = buildStartRecordingVoiceConfSysMsg(liveMeeting.props.meetingProp.intId, liveMeeting.props.voiceProp.voiceConf)
      outGW.send(event)
    } else {
      log.info("Not recording audio as numVoiceUsers={} and isRecording={} and recordProp={}", numVoiceUsers,
        MeetingStatus2x.isVoiceRecording(liveMeeting.status), liveMeeting.props.recordProp.record)
    }
  }

  def buildStartRecordingVoiceConfSysMsg(meetingId: String, voiceConf: String): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(StartRecordingVoiceConfSysMsg.NAME, routing)
    val header = BbbCoreHeaderWithMeetingId(StartRecordingVoiceConfSysMsg.NAME, meetingId)
    val body = StartRecordingVoiceConfSysMsgBody(voiceConf, meetingId)
    val event = StartRecordingVoiceConfSysMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, event)
  }

}
