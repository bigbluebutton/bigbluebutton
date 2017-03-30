package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._
import org.bigbluebutton.common.messages.WhiteboardKeyUtil
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.LiveMeeting

case class Whiteboard(id: String, shapeCount: Int, shapesMap: scala.collection.immutable.Map[String, scala.collection.immutable.List[AnnotationVO]])

trait WhiteboardApp {
  this: LiveMeeting =>

  val outGW: OutMessageGateway

  def handleSendWhiteboardAnnotationRequest(msg: SendWhiteboardAnnotationRequest) {
    val shape = msg.annotation
    val status = shape.status
    val shapeType = shape.shapeType
    val wbId = shape.wbId
    val userId = msg.requesterID

    //initWhiteboard(wbId)

    //    println("Received whiteboard shape. status=[" + status + "], shapeType=[" + shapeType + "]")

    if (WhiteboardKeyUtil.TEXT_CREATED_STATUS == status || WhiteboardKeyUtil.DRAW_START_STATUS == status) {
      //      println("Received textcreated status")
      wbModel.addAnnotation(wbId, userId, shape)
    } else if (WhiteboardKeyUtil.DRAW_UPDATE_STATUS == status) {
      wbModel.updateAnnotation(wbId, userId, shape)
    } else if (WhiteboardKeyUtil.DRAW_END_STATUS == status) {
      wbModel.updateAnnotation(wbId, userId, shape)
    } else if (WhiteboardKeyUtil.TEXT_TYPE == shapeType) {
      //	    println("Received [" + shapeType +"] modify text status")
      wbModel.modifyText(wbId, userId, shape)
    } else {
      //	    println("Received UNKNOWN whiteboard shape!!!!. status=[" + status + "], shapeType=[" + shapeType + "]")
    }
    if (wbModel.hasWhiteboard(wbId)) {
      //        println("WhiteboardApp::handleSendWhiteboardAnnotationRequest - num shapes [" + wb.shapes.length + "]")
      outGW.send(new SendWhiteboardAnnotationEvent(mProps.meetingID, mProps.recorded, msg.requesterID, wbId, msg.annotation))
    }

  }

  def handleGetWhiteboardShapesRequest(msg: GetWhiteboardShapesRequest) {
    //println("WB: Received page history [" + msg.whiteboardId + "]")
    val history = wbModel.getHistory(msg.whiteboardId);
    if (history.length > 0) {
      outGW.send(new GetWhiteboardShapesReply(mProps.meetingID, mProps.recorded, msg.requesterID, msg.whiteboardId, history, msg.replyTo))
    }
  }

  def handleClearWhiteboardRequest(msg: ClearWhiteboardRequest) {
    //println("WB: Received clear whiteboard")
    // wbModel.clearWhiteboard(msg.whiteboardId)
    // if (wbModel.hasWhiteboard(msg.whiteboardId)) {
    // outGW.send(new ClearWhiteboardEvent(mProps.meetingID, mProps.recorded, msg.requesterID, msg.whiteboardId))
    // }
  }

  def handleUndoWhiteboardRequest(msg: UndoWhiteboardRequest) {
    //    println("WB: Received undo whiteboard")
    wbModel.undoWhiteboard(msg.whiteboardId, msg.requesterID) foreach { last =>
      outGW.send(new UndoWhiteboardEvent(mProps.meetingID, mProps.recorded, msg.requesterID, msg.whiteboardId, last.id))
    }
    // wbModel.getWhiteboard(msg.whiteboardId) foreach { wb =>
    // wbModel.undoWhiteboard(msg.whiteboardId) foreach { last =>
    // outGW.send(new UndoWhiteboardEvent(mProps.meetingID, mProps.recorded, msg.requesterID, wb.id, last.id))
    // }
    // }
  }

  def handleModifyWhiteboardAccessRequest(msg: ModifyWhiteboardAccessRequest) {
    wbModel.modifyWhiteboardAccess(msg.multiUser)
    outGW.send(new ModifiedWhiteboardAccessEvent(mProps.meetingID, mProps.recorded, msg.requesterID, msg.multiUser))
  }

  def handleIsWhiteboardEnabledRequest(msg: IsWhiteboardEnabledRequest) {
    val enabled = wbModel.isWhiteboardEnabled()
    outGW.send(new IsWhiteboardEnabledReply(mProps.meetingID, mProps.recorded, msg.requesterID, enabled, msg.replyTo))
  }
}
