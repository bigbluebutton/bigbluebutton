package org.bigbluebutton.core.running.handlers

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.{ GetRecordingStatus, GetRecordingStatusReply }
import org.bigbluebutton.core.running.{ MeetingActor, MeetingStateModel }

trait GetRecordingStatusMsgHdlr {
  this: MeetingActor =>

  val state: MeetingStateModel
  val outGW: OutMessageGateway

  def handle(msg: GetRecordingStatus) {
    outGW.send(new GetRecordingStatusReply(state.mProps.meetingID, state.mProps.recorded, msg.userId, state.meetingModel.isRecording().booleanValue()))
  }
}
