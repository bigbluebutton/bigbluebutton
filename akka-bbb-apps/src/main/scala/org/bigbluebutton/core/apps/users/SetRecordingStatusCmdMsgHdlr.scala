package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait SetRecordingStatusCmdMsgHdlr extends RightsManagementTrait {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleSetRecordingStatusCmdMsg(msg: SetRecordingStatusCmdMsg) {
    log.info("Change recording status. meetingId=" + liveMeeting.props.meetingProp.intId + " recording=" + msg.body.recording)

    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to clear chat in meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    } else {
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
