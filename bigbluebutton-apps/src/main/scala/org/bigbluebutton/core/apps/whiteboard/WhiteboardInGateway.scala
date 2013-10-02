package org.bigbluebutton.core.apps.whiteboard

import org.bigbluebutton.core.BigBlueButtonGateway
import org.bigbluebutton.core.apps.whiteboard.messages._

class WhiteboardInGateway(bbbGW: BigBlueButtonGateway) { 
  
	def sendWhiteboardAnnotation(meetingID: String, requesterID: String, annotation: Map[String, Object]) {	  
	  bbbGW.accept(new SendWhiteboardAnnotationRequest(meetingID, requesterID, annotation))
	}
	
	def setWhiteboardActivePage(meetingID: String, requesterID: String, page: Int){
	  bbbGW.accept(new SetWhiteboardActivePageRequest(meetingID, requesterID, page))
	}
	
	def requestWhiteboardAnnotationHistory(meetingID: String, requesterID: String, presentationID: String, page: Int) {
	  bbbGW.accept(new SendWhiteboardAnnotationHistoryRequest(meetingID, requesterID, presentationID, page))
	}
	
	def clearWhiteboard(meetingID: String, requesterID: String) {
	  bbbGW.accept(new ClearWhiteboardRequest(meetingID, requesterID))
	}
	
	def undoWhiteboard(meetingID: String, requesterID: String) {
	  bbbGW.accept(new UndoWhiteboardRequest(meetingID, requesterID))
	}
	
	def setActivePresentation(meetingID: String, requesterID: String, presentationID: String, numPages: Int) {
	  bbbGW.accept(new SetActivePresentationRequest(meetingID, requesterID, presentationID, numPages))
	}
	
	def enableWhiteboard(meetingID: String, requesterID: String, enable: Boolean) {
	  bbbGW.accept(new EnableWhiteboardRequest(meetingID, requesterID, enable))
	}
	
	def isWhiteboardEnabled(meetingID: String, requesterID: String) {
	  bbbGW.accept(new IsWhiteboardEnabledRequest(meetingID, requesterID))
	}
	
}