package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._
import org.bigbluebutton.common.messages.WhiteboardKeyUtil
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.running.{ LiveMeeting, MeetingActor }

case class Whiteboard(id: String, shapes: Seq[AnnotationVO])

trait WhiteboardApp {
  this: MeetingActor =>

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
      liveMeeting.wbModel.addAnnotation(wbId, shape)
    } else if ((WhiteboardKeyUtil.PENCIL_TYPE == shapeType)
      && (WhiteboardKeyUtil.DRAW_START_STATUS == status)) {
      //        println("Received pencil draw start status")
      liveMeeting.wbModel.addAnnotation(wbId, shape)
    } else if ((WhiteboardKeyUtil.DRAW_END_STATUS == status)
      && ((WhiteboardKeyUtil.RECTANGLE_TYPE == shapeType)
        || (WhiteboardKeyUtil.ELLIPSE_TYPE == shapeType)
        || (WhiteboardKeyUtil.TRIANGLE_TYPE == shapeType)
        || (WhiteboardKeyUtil.POLL_RESULT_TYPE == shapeType)
        || (WhiteboardKeyUtil.LINE_TYPE == shapeType))) {
      //        println("Received [" + shapeType +"] draw end status")
      liveMeeting.wbModel.addAnnotation(wbId, shape)
    } else if (WhiteboardKeyUtil.TEXT_TYPE == shapeType) {
      //	    println("Received [" + shapeType +"] modify text status")
      liveMeeting.wbModel.modifyText(wbId, shape)
    } else {
      //	    println("Received UNKNOWN whiteboard shape!!!!. status=[" + status + "], shapeType=[" + shapeType + "]")
    }
    liveMeeting.wbModel.getWhiteboard(wbId) foreach { wb =>
      //        println("WhiteboardApp::handleSendWhiteboardAnnotationRequest - num shapes [" + wb.shapes.length + "]")
      outGW.send(new SendWhiteboardAnnotationEvent(mProps.meetingID, mProps.recorded, msg.requesterID, wbId, msg.annotation))
    }

  }

  private def initWhiteboard(wbId: String) {
    if (!liveMeeting.wbModel.hasWhiteboard(wbId)) {
      liveMeeting.wbModel.createWhiteboard(wbId)
    }
  }

  def handleGetWhiteboardShapesRequest(msg: GetWhiteboardShapesRequest) {
    //println("WB: Received page history [" + msg.whiteboardId + "]")
    liveMeeting.wbModel.history(msg.whiteboardId) foreach { wb =>
      outGW.send(new GetWhiteboardShapesReply(mProps.meetingID, mProps.recorded, msg.requesterID, wb.id, wb.shapes.toArray, msg.replyTo))
    }
  }

  def handleClearWhiteboardRequest(msg: ClearWhiteboardRequest) {
    //println("WB: Received clear whiteboard")
    liveMeeting.wbModel.clearWhiteboard(msg.whiteboardId)
    liveMeeting.wbModel.getWhiteboard(msg.whiteboardId) foreach { wb =>
      outGW.send(new ClearWhiteboardEvent(mProps.meetingID, mProps.recorded, msg.requesterID, wb.id))
    }
  }

  def handleUndoWhiteboardRequest(msg: UndoWhiteboardRequest) {
    //    println("WB: Received undo whiteboard")

    liveMeeting.wbModel.getWhiteboard(msg.whiteboardId) foreach { wb =>
      liveMeeting.wbModel.undoWhiteboard(msg.whiteboardId) foreach { last =>
        outGW.send(new UndoWhiteboardEvent(mProps.meetingID, mProps.recorded, msg.requesterID, wb.id, last.id))
      }
    }
  }

  def handleEnableWhiteboardRequest(msg: EnableWhiteboardRequest) {
    liveMeeting.wbModel.enableWhiteboard(msg.enable)
    outGW.send(new WhiteboardEnabledEvent(mProps.meetingID, mProps.recorded, msg.requesterID, msg.enable))
  }

  def handleIsWhiteboardEnabledRequest(msg: IsWhiteboardEnabledRequest) {
    val enabled = liveMeeting.wbModel.isWhiteboardEnabled()
    outGW.send(new IsWhiteboardEnabledReply(mProps.meetingID, mProps.recorded, msg.requesterID, enabled, msg.replyTo))
  }
}
