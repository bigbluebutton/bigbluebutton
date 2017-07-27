package org.bigbluebutton.core.apps.sharednotes

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.OutMsgRouter

trait UpdateSharedNoteReqMsgHdlr {
  this: SharedNotesApp2x =>

  val outGW: OutMsgRouter

  def handleUpdateSharedNoteReqMsg(msg: UpdateSharedNoteReqMsg): Unit = {

    def broadcastEvent(msg: UpdateSharedNoteReqMsg, userId: String, patch: String, patchId: Int, undo: Boolean, redo: Boolean): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, userId)
      val envelope = BbbCoreEnvelope(UpdateSharedNoteRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(UpdateSharedNoteRespMsg.NAME, liveMeeting.props.meetingProp.intId, userId)

      val body = UpdateSharedNoteRespMsgBody(msg.body.noteId, patch, patchId, undo, redo)
      val event = UpdateSharedNoteRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    val userId = msg.body.operation match {
      case "PATCH" => msg.header.userId
      case "UNDO"  => liveMeeting.notesModel.SYSTEM_ID
      case "REDO"  => liveMeeting.notesModel.SYSTEM_ID
      case _       => return
    }

    val (patchId, patch, undo, redo) = liveMeeting.notesModel.patchNote(msg.body.noteId, msg.body.patch, msg.body.operation)

    if (patch != "") {
      broadcastEvent(msg, userId, patch, patchId, undo, redo)
    } else {
      log.warning("Could not patch note " + msg.body.noteId)
    }
  }
}
