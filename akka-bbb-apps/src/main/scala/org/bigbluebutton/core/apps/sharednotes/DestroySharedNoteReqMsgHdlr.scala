package org.bigbluebutton.core.apps.sharednotes

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.OutMsgRouter

trait DestroySharedNoteReqMsgHdlr {
  this: SharedNotesApp2x =>

  val outGW: OutMsgRouter

  def handleDestroySharedNoteReqMsg(msg: DestroySharedNoteReqMsg): Unit = {

    def broadcastEvent(msg: DestroySharedNoteReqMsg, isNotesLimit: Boolean): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(DestroySharedNoteRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(DestroySharedNoteRespMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = DestroySharedNoteRespMsgBody(msg.body.noteId, isNotesLimit)
      val event = DestroySharedNoteRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    val isNotesLimit = liveMeeting.notesModel.destroyNote(msg.body.noteId)
    broadcastEvent(msg, isNotesLimit)
  }
}
