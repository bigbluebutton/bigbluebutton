package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._
import org.bigbluebutton.common.messages.WhiteboardKeyUtil
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.LiveMeeting

case class Whiteboard(id: String, shapes: Seq[AnnotationVO])

trait WhiteboardApp {
  this: LiveMeeting =>

  val outGW: OutMessageGateway

  def handleSendWhiteboardAnnotationRequest(msg: SendWhiteboardAnnotationRequest) {
    val status = msg.annotation.status
    val shapeType = msg.annotation.shapeType
    val wbId = msg.annotation.wbId
    val shape = msg.annotation

    initWhiteboard(wbId)

    //    println("Received whiteboard shape. status=[" + status + "], shapeType=[" + shapeType + "]")

    if (WhiteboardKeyUtil.TEXT_CREATED_STATUS == status) {
      //      println("Received textcreated status")
      wbModel.addAnnotation(wbId, shape)
    } else if ((WhiteboardKeyUtil.PENCIL_TYPE == shapeType)
      && (WhiteboardKeyUtil.DRAW_START_STATUS == status)) {
      //        println("Received pencil draw start status")
      wbModel.addAnnotation(wbId, shape)
    } else if ((WhiteboardKeyUtil.DRAW_END_STATUS == status)
      && ((WhiteboardKeyUtil.RECTANGLE_TYPE == shapeType)
        || (WhiteboardKeyUtil.ELLIPSE_TYPE == shapeType)
        || (WhiteboardKeyUtil.TRIANGLE_TYPE == shapeType)
        || (WhiteboardKeyUtil.POLL_RESULT_TYPE == shapeType)
        || (WhiteboardKeyUtil.LINE_TYPE == shapeType))) {
      //        println("Received [" + shapeType +"] draw end status")
      wbModel.addAnnotation(wbId, shape)
    } else if (WhiteboardKeyUtil.TEXT_TYPE == shapeType) {
      //	    println("Received [" + shapeType +"] modify text status")
      wbModel.modifyText(wbId, shape)
    } else {
      //	    println("Received UNKNOWN whiteboard shape!!!!. status=[" + status + "], shapeType=[" + shapeType + "]")
    }
    wbModel.getWhiteboard(wbId) foreach { wb =>
      //        println("WhiteboardApp::handleSendWhiteboardAnnotationRequest - num shapes [" + wb.shapes.length + "]")
      outGW.send(new SendWhiteboardAnnotationEvent(mProps.meetingID, mProps.recorded, msg.requesterID, wbId, msg.annotation))
    }

  }

  private def initWhiteboard(wbId: String) {
    if (!wbModel.hasWhiteboard(wbId)) {
      wbModel.createWhiteboard(wbId)
    }
  }

  def handleGetWhiteboardShapesRequest(msg: GetWhiteboardShapesRequest) {
    //println("WB: Received page history [" + msg.whiteboardId + "]")
    wbModel.history(msg.whiteboardId) foreach { wb =>
      outGW.send(new GetWhiteboardShapesReply(mProps.meetingID, mProps.recorded, msg.requesterID, wb.id, wb.shapes.toArray, msg.replyTo))
    }
  }

  def handleClearWhiteboardRequest(msg: ClearWhiteboardRequest) {
    //println("WB: Received clear whiteboard")
    wbModel.clearWhiteboard(msg.whiteboardId)
    wbModel.getWhiteboard(msg.whiteboardId) foreach { wb =>
      outGW.send(new ClearWhiteboardEvent(mProps.meetingID, mProps.recorded, msg.requesterID, wb.id))
    }
  }

  def handleUndoWhiteboardRequest(msg: UndoWhiteboardRequest) {
    //    println("WB: Received undo whiteboard")

    wbModel.getWhiteboard(msg.whiteboardId) foreach { wb =>
      wbModel.undoWhiteboard(msg.whiteboardId) foreach { last =>
        outGW.send(new UndoWhiteboardEvent(mProps.meetingID, mProps.recorded, msg.requesterID, wb.id, last.id))
      }
    }
  }

  def handleEnableWhiteboardRequest(msg: EnableWhiteboardRequest) {
    wbModel.enableWhiteboard(msg.enable)
    outGW.send(new WhiteboardEnabledEvent(mProps.meetingID, mProps.recorded, msg.requesterID, msg.enable))
  }

  def handleIsWhiteboardEnabledRequest(msg: IsWhiteboardEnabledRequest) {
    val enabled = wbModel.isWhiteboardEnabled()
    outGW.send(new IsWhiteboardEnabledReply(mProps.meetingID, mProps.recorded, msg.requesterID, enabled, msg.replyTo))
  }
}
