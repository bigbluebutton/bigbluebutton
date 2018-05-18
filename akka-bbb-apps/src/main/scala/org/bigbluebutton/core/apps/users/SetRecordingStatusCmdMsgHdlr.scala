package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.domain.{ MeetingRecordingTracker, MeetingState2x }
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core.util.TimeUtil

trait SetRecordingStatusCmdMsgHdlr {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleSetRecordingStatusCmdMsg(msg: SetRecordingStatusCmdMsg, state: MeetingState2x) {
    log.info("Change recording status. meetingId=" + liveMeeting.props.meetingProp.intId + " recording=" + msg.body.recording)
    if (liveMeeting.props.recordProp.allowStartStopRecording &&
      MeetingStatus2x.isRecording(liveMeeting.status) != msg.body.recording) {
      if (msg.body.recording) {
        log.debug("+++++++ Start timer {}", TimeUtil.timeNowInMs())

        MeetingStatus2x.recordingStarted(liveMeeting.status)

        val tracker = state.recordingTracker.startTimer(TimeUtil.timeNowInMs())
        state.update(tracker)
      } else {
        MeetingStatus2x.recordingStopped(liveMeeting.status)

        val tracker = state.recordingTracker.pauseTimer(TimeUtil.timeNowInMs())
        state.update(tracker)
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
