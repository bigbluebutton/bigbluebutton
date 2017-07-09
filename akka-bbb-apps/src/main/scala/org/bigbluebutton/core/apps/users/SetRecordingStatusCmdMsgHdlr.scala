package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting }
import org.bigbluebutton.core2.MeetingStatus2x

trait SetRecordingStatusCmdMsgHdlr {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMessageGateway

  def handleSetRecordingStatusCmdMsg(msg: SetRecordingStatusCmdMsg) {
    log.info("Change recording status. meetingId=" + liveMeeting.props.meetingProp.intId + " recording=" + msg.body.recording)
    if (liveMeeting.props.recordProp.allowStartStopRecording &&
      MeetingStatus2x.isRecording(liveMeeting.status) != msg.body.recording) {
      if (msg.body.recording) {
        MeetingStatus2x.recordingStarted(liveMeeting.status)
      } else {
        MeetingStatus2x.recordingStopped(liveMeeting.status)
      }

      val event = buildRecordingStatusChangedEvtMsg(liveMeeting.props.meetingProp.intId, msg.body.setBy, msg.body.recording)
      outGW.send(event)
    }

    def buildRecordingStatusChangedEvtMsg(meetingId: String, userId: String, recording: Boolean): BbbCommonEnvCoreMsg = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
      val envelope = BbbCoreEnvelope(RecordingStatusChangedEvtMsg.NAME, routing)
      val body = RecordingStatusChangedEvtMsgBody(recording, userId)
      val header = BbbClientMsgHeader(RecordingStatusChangedEvtMsg.NAME, meetingId, userId)
      val event = RecordingStatusChangedEvtMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }
  }
}
