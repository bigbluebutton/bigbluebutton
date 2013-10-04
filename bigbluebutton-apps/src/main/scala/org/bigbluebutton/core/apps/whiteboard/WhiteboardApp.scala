package org.bigbluebutton.core.apps.whiteboard

import org.bigbluebutton.core.api.InMessage
import org.bigbluebutton.core.api.MessageOutGateway
import org.bigbluebutton.core.apps.whiteboard.messages._
import org.bigbluebutton.conference.service.whiteboard.WhiteboardKeyUtil

class WhiteboardApp(meetingID: String, recorded: Boolean, outGW: MessageOutGateway) {

  val model = new WhiteboardModel
  
    def handleMessage(msg: InMessage):Unit = {
	    msg match {
	      case sendWhiteboardAnnotationRequest: SendWhiteboardAnnotationRequest => handleSendWhiteboardAnnotationRequest(sendWhiteboardAnnotationRequest)
	      case setWhiteboardActivePageRequest: SetWhiteboardActivePageRequest => handleSetWhiteboardActivePageRequest(setWhiteboardActivePageRequest)
	      case sendWhiteboardAnnotationHistoryRequest: SendWhiteboardAnnotationHistoryRequest => handleSendWhiteboardAnnotationHistoryRequest(sendWhiteboardAnnotationHistoryRequest)
	      case clearWhiteboardRequest: ClearWhiteboardRequest => handleClearWhiteboardRequest(clearWhiteboardRequest)
	      case undoWhiteboardRequest: UndoWhiteboardRequest => handleUndoWhiteboardRequest(undoWhiteboardRequest)
	      case setActivePresentationRequest: SetActivePresentationRequest => handleSetActivePresentationRequest(setActivePresentationRequest)
	      case enableWhiteboardRequest: EnableWhiteboardRequest => handleEnableWhiteboardRequest(enableWhiteboardRequest)
	      case isWhiteboardEnabledRequest: IsWhiteboardEnabledRequest => handleIsWhiteboardEnabledRequest(isWhiteboardEnabledRequest)
	      case _ => // do nothing
	    }
    }
    
    private def handleSendWhiteboardAnnotationRequest(msg: SendWhiteboardAnnotationRequest) {
      val status = msg.annotation.status
      val shapeType = msg.annotation.shapeType
      val shape = msg.annotation
      
      if ("textCreated".equals(status)) {
		model.addAnnotation(shape)
      } else if ((WhiteboardKeyUtil.PENCIL_TYPE == shapeType) && ("DRAW_START" == status)) {
		model.addAnnotation(shape)
      } else if (("DRAW_END" == status) && ((WhiteboardKeyUtil.RECTANGLE_TYPE == shapeType) 
														|| (WhiteboardKeyUtil.ELLIPSE_TYPE == shapeType)
														|| (WhiteboardKeyUtil.TRIANGLE_TYPE == shapeType)
														|| (WhiteboardKeyUtil.LINE_TYPE == shapeType))) {				
				model.addAnnotation(shape)
      } else {
		if ("text" == shapeType) {
			model.modifyText(shape)
		}
      }
      
      outGW.send(new SendWhiteboardAnnotationEvent(meetingID, recorded, msg.requesterID, msg.annotation))
    }
    
    private def handleSetWhiteboardActivePageRequest(msg: SetWhiteboardActivePageRequest) {
      model.changePage(msg.page)
      
      outGW.send(new ChangeWhiteboardPageEvent(meetingID, recorded, msg.requesterID, msg.page, model.history.length))
    }
    
    private def handleSendWhiteboardAnnotationHistoryRequest(msg: SendWhiteboardAnnotationHistoryRequest) {
      val history = model.history
      outGW.send(new SendWhiteboardAnnotationHistoryReply(meetingID, recorded, msg.requesterID, model.activePresentation, model.numPages, history))
    }
    
    private def handleClearWhiteboardRequest(msg: ClearWhiteboardRequest) {
      model.clearWhiteboard()
      
      outGW.send(new ClearWhiteboardEvent(meetingID, recorded, msg.requesterID))
    }
    
    private def handleUndoWhiteboardRequest(msg: UndoWhiteboardRequest) {
      model.undoWhiteboard()
      
      outGW.send(new UndoWhiteboardEvent(meetingID, recorded, msg.requesterID))
    }
    
    private def handleSetActivePresentationRequest(msg: SetActivePresentationRequest) {
      model.setActivePresentation(msg.presentationID, msg.numPages)
      
      outGW.send(new WhiteboardActivePresentationEvent(meetingID, recorded, msg.requesterID, msg.presentationID, msg.numPages))
    }
    
    private def handleEnableWhiteboardRequest(msg: EnableWhiteboardRequest) {
      model.enableWhiteboard(msg.enable)
      
      outGW.send(new WhiteboardEnabledEvent(meetingID, recorded, msg.requesterID, msg.enable))
    }
    
    private def handleIsWhiteboardEnabledRequest(msg: IsWhiteboardEnabledRequest) {
      val enabled = model.isWhiteboardEnabled()
      
      outGW.send(new IsWhiteboardEnabledReply(meetingID, recorded, msg.requesterID, enabled))
    }
}