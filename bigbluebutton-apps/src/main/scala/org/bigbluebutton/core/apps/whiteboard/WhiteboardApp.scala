package org.bigbluebutton.core.apps.whiteboard

import org.bigbluebutton.core.api._
import org.bigbluebutton.conference.service.whiteboard.WhiteboardKeyUtil
import net.lag.logging.Logger
import org.bigbluebutton.core.MeetingActor
import org.bigbluebutton.core.apps.whiteboard.vo._

case class Page2(num:Int, current: Boolean = false, shapes: Seq[AnnotationVO])
case class Presentation2(val presentationID: String, val numPages: Int, 
                 current: Boolean = false, pages:scala.collection.immutable.HashMap[Int, Page2])

trait WhiteboardApp {
  this : MeetingActor =>
  
  private val log = Logger.get
  val outGW: MessageOutGateway
  
  private val wbModel = new WhiteboardModel
  
  def handleSendWhiteboardAnnotationRequest(msg: SendWhiteboardAnnotationRequest) {
      val status = msg.annotation.status
      val shapeType = msg.annotation.shapeType
      val shape = msg.annotation
      
      if (WhiteboardKeyUtil.TEXT_CREATED_STATUS == status) {
		wbModel.addAnnotation(shape)
      } else if ((WhiteboardKeyUtil.PENCIL_TYPE == shapeType) 
              && (WhiteboardKeyUtil.DRAW_START_STATUS == status)) {
		wbModel.addAnnotation(shape)
      } else if ((WhiteboardKeyUtil.DRAW_END_STATUS == status) 
             && ((WhiteboardKeyUtil.RECTANGLE_TYPE == shapeType) 
              || (WhiteboardKeyUtil.ELLIPSE_TYPE == shapeType)
			  || (WhiteboardKeyUtil.TRIANGLE_TYPE == shapeType)
			  || (WhiteboardKeyUtil.LINE_TYPE == shapeType))) {				
		wbModel.addAnnotation(shape)
      } else {
		if (WhiteboardKeyUtil.TEXT_TYPE == shapeType) {
			wbModel.modifyText(shape)
		}
      }
      
      outGW.send(new SendWhiteboardAnnotationEvent(meetingID, recorded, msg.requesterID, wbModel.activePresentation, wbModel.currentPage, msg.annotation))
    }
    
  def handleSetWhiteboardActivePageRequest(msg: SetWhiteboardActivePageRequest) {
      wbModel.changePage(msg.page)
      
      outGW.send(new ChangeWhiteboardPageEvent(meetingID, recorded, msg.requesterID, msg.page, wbModel.history.length))
    }
    
  def handleSendWhiteboardAnnotationHistoryRequest(msg: SendWhiteboardAnnotationHistoryRequest) {
      val history = wbModel.history
      outGW.send(new SendWhiteboardAnnotationHistoryReply(meetingID, recorded, msg.requesterID, wbModel.activePresentation, wbModel.numPages, history))
    }
    
  def handleClearWhiteboardRequest(msg: ClearWhiteboardRequest) {
      wbModel.clearWhiteboard()
      
      outGW.send(new ClearWhiteboardEvent(meetingID, recorded, msg.requesterID, wbModel.activePresentation, wbModel.currentPage))
    }
    
  def handleUndoWhiteboardRequest(msg: UndoWhiteboardRequest) {
      wbModel.undoWhiteboard()
      
      outGW.send(new UndoWhiteboardEvent(meetingID, recorded, msg.requesterID, wbModel.activePresentation, wbModel.currentPage))
    }
    
  def handleSetActivePresentationRequest(msg: SetActivePresentationRequest) {
      wbModel.setActivePresentation(msg.presentationID, msg.numPages)
      
      outGW.send(new WhiteboardActivePresentationEvent(meetingID, recorded, msg.requesterID, msg.presentationID, msg.numPages))
    }
    
  def handleEnableWhiteboardRequest(msg: EnableWhiteboardRequest) {
      wbModel.enableWhiteboard(msg.enable)
      
      outGW.send(new WhiteboardEnabledEvent(meetingID, recorded, msg.requesterID, msg.enable))
    }
    
  def handleIsWhiteboardEnabledRequest(msg: IsWhiteboardEnabledRequest) {
      val enabled = wbModel.isWhiteboardEnabled()
      
      outGW.send(new IsWhiteboardEnabledReply(meetingID, recorded, msg.requesterID, enabled))
    }
}