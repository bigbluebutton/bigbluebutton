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
  
  val notes = new scala.collection.mutable.HashMap[String, String]()
  notes += ("MAIN_WINDOW" -> "")
  val patcher = new diff_match_patch()
  var notesCounter = 1;
  
  def handlePatchDocumentRequest(msg: PatchDocumentRequest) {
    // meetingId, userId, noteId, patch, beginIndex, endIndex
    notes.synchronized {
      val document = notes(msg.noteID)
      val patchObjects = patcher.patch_fromText(msg.patch)
      val result = patcher.patch_apply(patchObjects, document)
      notes(msg.noteID) = result(0).toString()
    }

    outGW.send(new PatchDocumentReply(meetingID, recorded, msg.requesterID, msg.noteID, msg.patch, msg.beginIndex, msg.endIndex))
  }
  
  def handleGetCurrentDocumentRequest(msg: GetCurrentDocumentRequest) {
    val copyNotes = notes.toMap
    
    outGW.send(new GetCurrentDocumentReply(meetingID, recorded, msg.requesterID, copyNotes))
  }
    
  def handleCreateAdditionalNotesRequest(msg: CreateAdditionalNotesRequest) {
    var noteID = ""
    notes.synchronized {
      noteID = notesCounter.toString
      notes += (noteID -> "")
      notesCounter += 1
    }
   
    outGW.send(new CreateAdditionalNotesReply(meetingID, recorded, msg.requesterID, noteID))
  }
    
  def handleDestroyAdditionalNotesRequest(msg: DestroyAdditionalNotesRequest) {
    notes.synchronized {
      notes -= msg.noteID
    }

    outGW.send(new DestroyAdditionalNotesReply(meetingID, recorded, msg.requesterID, msg.noteID))
  }
}