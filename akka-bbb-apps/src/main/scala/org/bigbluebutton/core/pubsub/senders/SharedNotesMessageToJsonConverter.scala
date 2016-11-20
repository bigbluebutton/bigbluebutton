package org.bigbluebutton.core.pubsub.senders

import org.bigbluebutton.core.messaging.Util
import org.bigbluebutton.core.api._
import com.google.gson.Gson
import scala.collection.JavaConverters._

object SharedNotesMessageToJsonConverter {
  def patchDocumentReplyToJson(msg: PatchDocumentReply): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.NOTE_ID, msg.noteID)
    payload.put(Constants.PATCH, msg.patch)
    payload.put(Constants.PATCH_ID, msg.patchID)
    payload.put(Constants.UNDO, msg.undo)
    payload.put(Constants.REDO, msg.redo)

    val header = Util.buildHeader(MessageNames.PATCH_DOCUMENT_REPLY, None)
    Util.buildJson(header, payload)
  }

  def getCurrentDocumentReplyToJson(msg: GetCurrentDocumentReply): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.NOTES, msg.notes.asJava)

    val header = Util.buildHeader(MessageNames.GET_CURRENT_DOCUMENT_REPLY, None)
    Util.buildJson(header, payload)
  }

  def createAdditionalNotesReplyToJson(msg: CreateAdditionalNotesReply): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.NOTE_NAME, msg.noteName)
    payload.put(Constants.NOTE_ID, msg.noteID)

    val header = Util.buildHeader(MessageNames.CREATE_ADDITIONAL_NOTES_REPLY, None)
    Util.buildJson(header, payload)
  }

  def destroyAdditionalNotesReplyToJson(msg: DestroyAdditionalNotesReply): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.NOTE_ID, msg.noteID)

    val header = Util.buildHeader(MessageNames.DESTROY_ADDITIONAL_NOTES_REPLY, None)
    Util.buildJson(header, payload)
  }

  def sharedNotesSyncNoteReplyToJson(msg: SharedNotesSyncNoteReply): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.NOTE_ID, msg.noteID)
    payload.put(Constants.NOTE, msg.note)

    val header = Util.buildHeader(MessageNames.SHAREDNOTES_SYNC_NOTE_REPLY, None)
    Util.buildJson(header, payload)
  }
}
