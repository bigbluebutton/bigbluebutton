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
    
    println("Received whiteboard shape. status=[" + status + "], shapeType=[" + shapeType + "]")

    if (WhiteboardKeyUtil.TEXT_CREATED_STATUS == status) {
      println("Received textcreated status")
      wbModel.addAnnotation(shape)
    } else if ((WhiteboardKeyUtil.PENCIL_TYPE == shapeType) 
            && (WhiteboardKeyUtil.DRAW_START_STATUS == status)) {
        println("Received pencil draw start status")
		wbModel.addAnnotation(shape)
    } else if ((WhiteboardKeyUtil.DRAW_END_STATUS == status) 
           && ((WhiteboardKeyUtil.RECTANGLE_TYPE == shapeType) 
            || (WhiteboardKeyUtil.ELLIPSE_TYPE == shapeType)
	        || (WhiteboardKeyUtil.TRIANGLE_TYPE == shapeType)
	        || (WhiteboardKeyUtil.LINE_TYPE == shapeType))) {	
        println("Received [" + shapeType +"] draw end status")
		wbModel.addAnnotation(shape)
    } else if (WhiteboardKeyUtil.TEXT_TYPE == shapeType) {
	    println("Received [" + shapeType +"] modify text status")
	   wbModel.modifyText(shape)
	} else {
	    println("Received UNKNOWN whiteboard shape!!!!. status=[" + status + "], shapeType=[" + shapeType + "]")
	}
      
    wbModel.getCurrentPresentation foreach {pres =>
      wbModel.getCurrentPage(pres) foreach {page =>
        println("WhiteboardApp::handleSendWhiteboardAnnotationRequest - num shapes [" + page.shapes.length + "]")
        outGW.send(new SendWhiteboardAnnotationEvent(meetingID, recorded, 
                      msg.requesterID, 
                      pres.presentationID, page.num, msg.annotation))          
     }
   }
  }
    
  def handleSetWhiteboardActivePageRequest(msg: SetWhiteboardActivePageRequest) {
    println("WB: Received set current page [" + msg.page + "]")
      wbModel.changePage(msg.page) foreach {page =>
        outGW.send(new ChangeWhiteboardPageEvent(meetingID, recorded, 
                        msg.requesterID, msg.page, 
                        page.shapes.length))        
      }      
    }
    
  def handleSendWhiteboardAnnotationHistoryRequest(msg: SendWhiteboardAnnotationHistoryRequest) {
    println("WB: Received page history [" + msg.page + "]")
      wbModel.getCurrentPresentation foreach {pres =>
        wbModel.getCurrentPage(pres) foreach {page =>
          outGW.send(new SendWhiteboardAnnotationHistoryReply(meetingID, recorded, 
                       msg.requesterID, pres.presentationID, 
                       pres.numPages, page.shapes.toArray))         
        }
      }
    }
    
  def handleClearWhiteboardRequest(msg: ClearWhiteboardRequest) {
    println("WB: Received clear whiteboard")
      wbModel.clearWhiteboard()
      wbModel.getCurrentPresentation foreach {pres =>
        wbModel.getCurrentPage(pres) foreach {page =>
          outGW.send(new ClearWhiteboardEvent(meetingID, recorded, 
                       msg.requesterID, 
                       pres.presentationID, page.num))        
        }
      }      
    }
    
  def handleUndoWhiteboardRequest(msg: UndoWhiteboardRequest) {
    println("WB: Received undo whiteboard")
      wbModel.undoWhiteboard()
      wbModel.getCurrentPresentation foreach {pres =>
        wbModel.getCurrentPage(pres) foreach {page =>
          outGW.send(new UndoWhiteboardEvent(meetingID, recorded, msg.requesterID, 
                       pres.presentationID, page.num))       
        }
      }       

    }
    
  def handleSetActivePresentationRequest(msg: SetActivePresentationRequest) {
    println("WB: Received set active presentation id[" + msg.presentationID + "] numPages=[" + msg.numPages + "]")
      wbModel.setActivePresentation(msg.presentationID, msg.numPages)

      wbModel.getCurrentPresentation foreach {pres =>
        wbModel.getCurrentPage(pres) foreach {page =>
          outGW.send(new WhiteboardActivePresentationEvent(meetingID, recorded, 
                       msg.requesterID, msg.presentationID, msg.numPages))      
        }
      }       

    }
    
  def handleEnableWhiteboardRequest(msg: EnableWhiteboardRequest) {
      wbModel.enableWhiteboard(msg.enable)
      
      outGW.send(new WhiteboardEnabledEvent(meetingID, recorded, 
                       msg.requesterID, msg.enable))
    }
    
  def handleIsWhiteboardEnabledRequest(msg: IsWhiteboardEnabledRequest) {
      val enabled = wbModel.isWhiteboardEnabled()
      
      outGW.send(new IsWhiteboardEnabledReply(meetingID, recorded, 
                       msg.requesterID, enabled))
    }
}