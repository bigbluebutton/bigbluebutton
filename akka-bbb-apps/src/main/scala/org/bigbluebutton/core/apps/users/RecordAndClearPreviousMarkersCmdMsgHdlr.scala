package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core.util.TimeUtil

trait RecordAndClearPreviousMarkersCmdMsgHdlr {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleRecordAndClearPreviousMarkersCmdMsg(msg: RecordAndClearPreviousMarkersCmdMsg, state: MeetingState2x): MeetingState2x = {
    log.info("Set a new recording marker and clear previous ones. meetingId=" + liveMeeting.props.meetingProp.intId + " recording=" + msg.body.recording)

    def buildRecordingStatusChangedEvtMsg(meetingId: String, userId: String, recording: Boolean): BbbCommonEnvCoreMsg = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
      val envelope = BbbCoreEnvelope(RecordingStatusChangedEvtMsg.NAME, routing)
      val body = RecordingStatusChangedEvtMsgBody(recording, userId)
      val header = BbbClientMsgHeader(RecordingStatusChangedEvtMsg.NAME, meetingId, userId)
      val event = RecordingStatusChangedEvtMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }

    // Do not allow stop recording and clear previous markers
    if (liveMeeting.props.recordProp.allowStartStopRecording &&
      MeetingStatus2x.isRecording(liveMeeting.status) != msg.body.recording) {

      MeetingStatus2x.recordingStarted(liveMeeting.status)

      val tracker = state.recordingTracker.resetTimer(TimeUtil.timeNowInMs())
      val event = buildRecordingStatusChangedEvtMsg(liveMeeting.props.meetingProp.intId, msg.body.setBy, msg.body.recording)
      outGW.send(event)

      state.update(tracker)
    } else {
      state
    }
  }
}