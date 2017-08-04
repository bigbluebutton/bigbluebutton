package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.breakout.BreakoutHdlrHelpers
import org.bigbluebutton.core.models.{ VoiceUserState, VoiceUsers }
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, MeetingActor, OutMsgRouter }
import org.bigbluebutton.core2.MeetingStatus2x

trait UserLeftVoiceConfEvtMsgHdlr extends BreakoutHdlrHelpers {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleUserLeftVoiceConfEvtMsg(msg: UserLeftVoiceConfEvtMsg): Unit = {

    def broadcastEvent(vu: VoiceUserState): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId,
        vu.intId)
      val envelope = BbbCoreEnvelope(UserLeftVoiceConfToClientEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(UserLeftVoiceConfToClientEvtMsg.NAME, liveMeeting.props.meetingProp.intId, vu.intId)

      val body = UserLeftVoiceConfToClientEvtMsgBody(voiceConf = msg.header.voiceConf, intId = vu.intId, voiceUserId = vu.intId)

      val event = UserLeftVoiceConfToClientEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    for {
      user <- VoiceUsers.findWithVoiceUserId(liveMeeting.voiceUsers, msg.body.voiceUserId)
    } yield {
      VoiceUsers.removeWithIntId(liveMeeting.voiceUsers, user.intId)
      broadcastEvent(user)
    }

    if (liveMeeting.props.meetingProp.isBreakout) {
      updateParentMeetingWithUsers()
    }

    stopRecordingVoiceConference()
  }

  def stopRecordingVoiceConference() {
    if (VoiceUsers.findAll(liveMeeting.voiceUsers).length == 0 &&
      liveMeeting.props.recordProp.record &&
      MeetingStatus2x.isVoiceRecording(liveMeeting.status)) {
      MeetingStatus2x.stopRecordingVoice(liveMeeting.status)

      val event = buildStopRecordingVoiceConfSysMsg(
        liveMeeting.props.meetingProp.intId,
        liveMeeting.props.voiceProp.voiceConf, MeetingStatus2x.getVoiceRecordingFilename(liveMeeting.status)
      )
      outGW.send(event)
    }
  }

  def buildStopRecordingVoiceConfSysMsg(meetingId: String, voiceConf: String, stream: String): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(StopRecordingVoiceConfSysMsg.NAME, routing)
    val header = BbbCoreHeaderWithMeetingId(StopRecordingVoiceConfSysMsg.NAME, meetingId)
    val body = StopRecordingVoiceConfSysMsgBody(voiceConf, meetingId, stream)
    val event = StopRecordingVoiceConfSysMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, event)
  }
}
