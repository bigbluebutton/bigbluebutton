package org.bigbluebutton.core.apps.sharednotes

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.OutMsgRouter

trait ClearSharedNotePubMsgHdlr {
  this: SharedNotesApp2x =>

  val outGW: OutMsgRouter

  def handleClearSharedNotePubMsg(msg: ClearSharedNotePubMsg): Unit = {

    def broadcastEvent(msg: ClearSharedNotePubMsg, noteReport: NoteReport): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(SyncSharedNoteEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(SyncSharedNoteEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = SyncSharedNoteEvtMsgBody(msg.body.noteId, noteReport)
      val event = SyncSharedNoteEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    liveMeeting.notesModel.clearNote(msg.body.noteId) match {
      case Some(noteReport) => broadcastEvent(msg, noteReport)
      case None             => log.warning("Could not find note " + msg.body.noteId)
    }
  }
}