package org.bigbluebutton.core.apps.sharednotes

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait CreateSharedNoteReqMsgHdlr extends RightsManagementTrait {
  this: SharedNotesApp2x =>

  def handle(msg: CreateSharedNoteReqMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastEvent(msg: CreateSharedNoteReqMsg, noteId: String, isNotesLimit: Boolean): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(CreateSharedNoteRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(CreateSharedNoteRespMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = CreateSharedNoteRespMsgBody(noteId, msg.body.noteName, isNotesLimit)
      val event = CreateSharedNoteRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to create new shared note."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    } else {
      if (!liveMeeting.notesModel.isNotesLimit) {
        val (noteId, isNotesLimit) = liveMeeting.notesModel.createNote(msg.body.noteName)
        broadcastEvent(msg, noteId, isNotesLimit)
      }
    }
  }
}
