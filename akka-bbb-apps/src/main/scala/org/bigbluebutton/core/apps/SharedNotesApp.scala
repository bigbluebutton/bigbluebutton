package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._
import org.bigbluebutton.core.MeetingActor
import org.bigbluebutton.core.OutMessageGateway

trait SharedNotesApp {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handlePatchDocumentRequest(msg: PatchDocumentRequest) {
    notesModel.patchDocument(msg.noteID, msg.patch)

    outGW.send(new PatchDocumentReply(mProps.meetingID, mProps.recorded, msg.requesterID, msg.noteID, msg.patch))
  }

  def handleGetCurrentDocumentRequest(msg: GetCurrentDocumentRequest) {
    val copyNotes = notesModel.notes.toMap

    outGW.send(new GetCurrentDocumentReply(mProps.meetingID, mProps.recorded, msg.requesterID, copyNotes))
  }

  private def createAdditionalNotes(requesterID: String, noteName: String = "") {
    notesModel.synchronized {
      val noteID = notesModel.createNote(noteName)

      outGW.send(new CreateAdditionalNotesReply(mProps.meetingID, mProps.recorded, requesterID, noteID, noteName))
    }
  }

  def handleCreateAdditionalNotesRequest(msg: CreateAdditionalNotesRequest) {
    createAdditionalNotes(msg.requesterID, msg.noteName)
  }

  def handleDestroyAdditionalNotesRequest(msg: DestroyAdditionalNotesRequest) {
    notesModel.synchronized {
      notesModel.destroyNote(msg.noteID)

      outGW.send(new DestroyAdditionalNotesReply(mProps.meetingID, mProps.recorded, msg.requesterID, msg.noteID))
    }
  }

  def handleRequestAdditionalNotesSetRequest(msg: RequestAdditionalNotesSetRequest) {
    while (notesModel.notesSize < msg.additionalNotesSetSize) {
      createAdditionalNotes(msg.requesterID)
    }
  }
}