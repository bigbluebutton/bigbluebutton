package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._
import org.bigbluebutton.common.messages.WhiteboardKeyUtil
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.running.{ MeetingActor, MeetingStateModel }

case class Whiteboard(id: String, shapes: Seq[AnnotationVO])

trait WhiteboardApp {
  this: MeetingActor =>

  val outGW: OutMessageGateway
  val state: MeetingStateModel

  def handleSendWhiteboardAnnotationRequest(msg: SendWhiteboardAnnotationRequest) {
    val status = msg.annotation.status
    val shapeType = msg.annotation.shapeType
    val wbId = msg.annotation.wbId
    val shape = msg.annotation

    initWhiteboard(wbId)

    //    println("Received whiteboard shape. status=[" + status + "], shapeType=[" + shapeType + "]")

    if (WhiteboardKeyUtil.TEXT_CREATED_STATUS == status) {
      //      println("Received textcreated status")
      state.wbModel.addAnnotation(wbId, shape)
    } else if ((WhiteboardKeyUtil.PENCIL_TYPE == shapeType)
      && (WhiteboardKeyUtil.DRAW_START_STATUS == status)) {
      //        println("Received pencil draw start status")
      state.wbModel.addAnnotation(wbId, shape)
    } else if ((WhiteboardKeyUtil.DRAW_END_STATUS == status)
      && ((WhiteboardKeyUtil.RECTANGLE_TYPE == shapeType)
        || (WhiteboardKeyUtil.ELLIPSE_TYPE == shapeType)
        || (WhiteboardKeyUtil.TRIANGLE_TYPE == shapeType)
        || (WhiteboardKeyUtil.POLL_RESULT_TYPE == shapeType)
        || (WhiteboardKeyUtil.LINE_TYPE == shapeType))) {
      //        println("Received [" + shapeType +"] draw end status")
      state.wbModel.addAnnotation(wbId, shape)
    } else if (WhiteboardKeyUtil.TEXT_TYPE == shapeType) {
      //	    println("Received [" + shapeType +"] modify text status")
      state.wbModel.modifyText(wbId, shape)
    } else {
      //	    println("Received UNKNOWN whiteboard shape!!!!. status=[" + status + "], shapeType=[" + shapeType + "]")
    }
    state.wbModel.getWhiteboard(wbId) foreach { wb =>
      //        println("WhiteboardApp::handleSendWhiteboardAnnotationRequest - num shapes [" + wb.shapes.length + "]")
      outGW.send(new SendWhiteboardAnnotationEvent(state.mProps.meetingID, state.mProps.recorded, msg.requesterID, wbId, msg.annotation))
    }

  }

  private def initWhiteboard(wbId: String) {
    if (!state.wbModel.hasWhiteboard(wbId)) {
      state.wbModel.createWhiteboard(wbId)
    }
  }

  def handleGetWhiteboardShapesRequest(msg: GetWhiteboardShapesRequest) {
    //println("WB: Received page history [" + msg.whiteboardId + "]")
    state.wbModel.history(msg.whiteboardId) foreach { wb =>
      outGW.send(new GetWhiteboardShapesReply(state.mProps.meetingID, state.mProps.recorded, msg.requesterID, wb.id, wb.shapes.toArray, msg.replyTo))
    }
  }

  def handleClearWhiteboardRequest(msg: ClearWhiteboardRequest) {
    //println("WB: Received clear whiteboard")
    state.wbModel.clearWhiteboard(msg.whiteboardId)
    state.wbModel.getWhiteboard(msg.whiteboardId) foreach { wb =>
      outGW.send(new ClearWhiteboardEvent(state.mProps.meetingID, state.mProps.recorded, msg.requesterID, wb.id))
    }
  }

  def handleUndoWhiteboardRequest(msg: UndoWhiteboardRequest) {
    //    println("WB: Received undo whiteboard")

    state.wbModel.getWhiteboard(msg.whiteboardId) foreach { wb =>
      state.wbModel.undoWhiteboard(msg.whiteboardId) foreach { last =>
        outGW.send(new UndoWhiteboardEvent(state.mProps.meetingID, state.mProps.recorded, msg.requesterID, wb.id, last.id))
      }
    }
  }

  def handleEnableWhiteboardRequest(msg: EnableWhiteboardRequest) {
    state.wbModel.enableWhiteboard(msg.enable)
    outGW.send(new WhiteboardEnabledEvent(state.mProps.meetingID, state.mProps.recorded, msg.requesterID, msg.enable))
  }

  def handleIsWhiteboardEnabledRequest(msg: IsWhiteboardEnabledRequest) {
    val enabled = state.wbModel.isWhiteboardEnabled()
    outGW.send(new IsWhiteboardEnabledReply(state.mProps.meetingID, state.mProps.recorded, msg.requesterID, enabled, msg.replyTo))
  }
}
