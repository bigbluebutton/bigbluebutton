package org.bigbluebutton.core.apps.whiteboard

import org.bigbluebutton.core.BigBlueButtonGateway
import org.bigbluebutton.core.apps.whiteboard.messages._
import org.bigbluebutton.core.apps.whiteboard.vo.AnnotationVO

class WhiteboardInGateway(bbbGW: BigBlueButtonGateway) { 
  
  private def buildAnnotation(annotation: Map[String, Object]):Option[AnnotationVO] = {
    var shape:Option[AnnotationVO] = None
    
    val id = annotation.getOrElse("id", null).asInstanceOf[String]
    val shapeType = annotation.getOrElse("type", null).asInstanceOf[String]
    val status = annotation.getOrElse("status", null).asInstanceOf[String]
    
    if (id != null && shapeType != null && status != null) {
      shape = Some(new AnnotationVO(id, shapeType, status, annotation.toMap))
    }
    
    shape
  }
  
  def sendWhiteboardAnnotation(meetingID: String, requesterID: String, annotation: Map[String, Object]) {	  
	  buildAnnotation(annotation) match {
	    case Some(shape) => {
	      println("************ Received annotation **************")
	      bbbGW.accept(new SendWhiteboardAnnotationRequest(meetingID, requesterID, shape))
	    }
	    case None => {
	      println("************ Ignoring Received annotation **************")
	    }// do nothing
	  }
  }
	
	def setWhiteboardActivePage(meetingID: String, requesterID: String, page: Int){
	  println("************ setWhiteboardActivePage **************")
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