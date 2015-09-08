package org.bigbluebutton.core.apps.sharednotes

import name.fraser.neil.plaintext.diff_match_patch
import name.fraser.neil.plaintext.diff_match_patch._
import org.bigbluebutton.core.api._
import org.bigbluebutton.core.MeetingActor
import scala.collection.JavaConversions._
import scala.collection._
import java.util.Collections


trait SharedNotesApp {
  this : MeetingActor =>
  
  val outGW: MessageOutGateway
  
  val notes = new scala.collection.mutable.HashMap[String, Note]()
  notes += ("MAIN_WINDOW" -> new Note("", ""))
  val patcher = new diff_match_patch()
  var notesCounter = 0;
  var removedNotes : Set[Int] = Set()
  
  def handlePatchDocumentRequest(msg: PatchDocumentRequest) {
    // meetingId, userId, noteId, patch, beginIndex, endIndex
    notes.synchronized {
      val note = notes(msg.noteID)
      val document = note.document
      val patchObjects = patcher.patch_fromText(msg.patch)
      val result = patcher.patch_apply(patchObjects, document)
      notes(msg.noteID) = new Note(note.name, result(0).toString())
    }

    outGW.send(new PatchDocumentReply(meetingID, recorded, msg.requesterID, msg.noteID, msg.patch, msg.beginIndex, msg.endIndex))
  }
  
  def handleGetCurrentDocumentRequest(msg: GetCurrentDocumentRequest) {
    val copyNotes = notes.toMap
    
    outGW.send(new GetCurrentDocumentReply(meetingID, recorded, msg.requesterID, copyNotes))
  }
    
  private def createAdditionalNotesNonSync(requesterID:String, noteName:String = "") {
    var noteID = 0
    if (removedNotes.isEmpty()) {
      notesCounter += 1
      noteID = notesCounter
    } else {
      noteID = removedNotes.min
      removedNotes -= noteID
    }
    notes += (noteID.toString -> new Note(noteName, ""))
   
    outGW.send(new CreateAdditionalNotesReply(meetingID, recorded, requesterID, noteID.toString, noteName))
  }

  def handleCreateAdditionalNotesRequest(msg: CreateAdditionalNotesRequest) {
    notes.synchronized {
      createAdditionalNotesNonSync(msg.requesterID, msg.noteName)
    }
  }
    
  def handleDestroyAdditionalNotesRequest(msg: DestroyAdditionalNotesRequest) {
    notes.synchronized {
      removedNotes += msg.noteID.toInt
      notes -= msg.noteID
    }

    outGW.send(new DestroyAdditionalNotesReply(meetingID, recorded, msg.requesterID, msg.noteID))
  }
    
  def handleRequestAdditionalNotesSetRequest(msg: RequestAdditionalNotesSetRequest) {
    notes.synchronized {
      var num = msg.additionalNotesSetSize - notes.size + 1
      for (i <- 1 to num) {
        createAdditionalNotesNonSync(msg.requesterID)
      }
    }
  }
}