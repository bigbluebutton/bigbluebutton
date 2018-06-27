package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core.util.TimeUtil
import org.bigbluebutton.core.bus.BigBlueButtonEvent
import org.bigbluebutton.core.api.SendRecordingTimerInternalMsg

trait SetRecordingStatusCmdMsgHdlr {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleSetRecordingStatusCmdMsg(msg: SetRecordingStatusCmdMsg, state: MeetingState2x): MeetingState2x = {
    log.info("Change recording status. meetingId=" + liveMeeting.props.meetingProp.intId + " recording=" + msg.body.recording)

    def buildRecordingStatusChangedEvtMsg(meetingId: String, userId: String, recording: Boolean): BbbCommonEnvCoreMsg = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
      val envelope = BbbCoreEnvelope(RecordingStatusChangedEvtMsg.NAME, routing)
      val body = RecordingStatusChangedEvtMsgBody(recording, userId)
      val header = BbbClientMsgHeader(RecordingStatusChangedEvtMsg.NAME, meetingId, userId)
      val event = RecordingStatusChangedEvtMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }

    if (liveMeeting.props.recordProp.allowStartStopRecording &&
      MeetingStatus2x.isRecording(liveMeeting.status) != msg.body.recording) {
      if (msg.body.recording) {
        MeetingStatus2x.recordingStarted(liveMeeting.status)
      } else {
        MeetingStatus2x.recordingStopped(liveMeeting.status)
      }

      val event = buildRecordingStatusChangedEvtMsg(liveMeeting.props.meetingProp.intId, msg.body.setBy, msg.body.recording)
      outGW.send(event)

      var newState = state
      if (MeetingStatus2x.isRecording(liveMeeting.status)) {
        val tracker = state.recordingTracker.startTimer(TimeUtil.timeNowInMs())
        newState = state.update(tracker)
      } else {
        val tracker = state.recordingTracker.pauseTimer(TimeUtil.timeNowInMs())
        newState = state.update(tracker)
      }
      eventBus.publish(BigBlueButtonEvent(liveMeeting.props.meetingProp.intId, SendRecordingTimerInternalMsg(liveMeeting.props.meetingProp.intId)))
      newState
    } else {
      state
    }

  }
}
