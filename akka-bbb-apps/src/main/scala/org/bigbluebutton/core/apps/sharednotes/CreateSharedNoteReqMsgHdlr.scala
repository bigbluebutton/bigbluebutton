package org.bigbluebutton.core.apps.sharednotes

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.OutMsgRouter

trait CreateSharedNoteReqMsgHdlr {
  this: SharedNotesApp2x =>

  val outGW: OutMsgRouter

  def handleCreateSharedNoteReqMsg(msg: CreateSharedNoteReqMsg): Unit = {

    def broadcastEvent(msg: CreateSharedNoteReqMsg, noteId: String): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(CreateSharedNoteRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(CreateSharedNoteRespMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = CreateSharedNoteRespMsgBody(noteId, msg.body.noteName)
      val event = CreateSharedNoteRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    val noteId = liveMeeting.notesModel.createNote(msg.body.noteName)
    broadcastEvent(msg, noteId)
  }
}
