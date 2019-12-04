package org.bigbluebutton.core.apps.sharednotes

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait ClearSharedNotePubMsgHdlr extends RightsManagementTrait {
  this: SharedNotesApp2x =>

  def handle(msg: ClearSharedNotePubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastEvent(msg: ClearSharedNotePubMsg, noteReport: NoteReport): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(SyncSharedNoteEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(SyncSharedNoteEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = SyncSharedNoteEvtMsgBody(msg.body.noteId, noteReport)
      val event = SyncSharedNoteEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to clear shared notes in meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    } else {
      liveMeeting.notesModel.clearNote(msg.body.noteId) match {
        case Some(noteReport) => broadcastEvent(msg, noteReport)
        case None             => log.warning("Could not find note " + msg.body.noteId)
      }
    }
  }
}
