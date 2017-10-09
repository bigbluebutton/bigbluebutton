package org.bigbluebutton.core.apps.sharednotes

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.{ LiveMeeting }

trait CreateSharedNoteReqMsgHdlr {
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

    if (!liveMeeting.notesModel.isNotesLimit) {
      val (noteId, isNotesLimit) = liveMeeting.notesModel.createNote(msg.body.noteName)
      broadcastEvent(msg, noteId, isNotesLimit)
    }
  }
}
