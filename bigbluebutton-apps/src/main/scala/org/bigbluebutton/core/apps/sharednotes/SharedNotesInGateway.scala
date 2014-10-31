package org.bigbluebutton.core.apps.sharednotes

import org.bigbluebutton.core.BigBlueButtonGateway
import org.bigbluebutton.core.api._

class SharedNotesInGateway(bbbGW: BigBlueButtonGateway) {

  def patchDocument(meetingId: String, userId: String, noteId: String,
      patch: String, beginIndex: Int, endIndex: Int) {
    bbbGW.accept(new PatchDocumentRequest(meetingId, userId, noteId, patch, beginIndex, endIndex));
  }
  
  def getCurrentDocument(meetingId: String, userId: String) {
    bbbGW.accept(new GetCurrentDocumentRequest(meetingId, userId));
  }
  
  def createAdditionalNotes(meetingId: String, userId: String) {
    bbbGW.accept(new CreateAdditionalNotesRequest(meetingId, userId));
  }
  
  def destroyAdditionalNotes(meetingId: String, userId: String, noteId: String) {
    bbbGW.accept(new DestroyAdditionalNotesRequest(meetingId, userId, noteId));
  }
}