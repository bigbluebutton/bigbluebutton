package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._
import org.bigbluebutton.common.messages.WhiteboardKeyUtil
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.running.{ MeetingActor }

case class Whiteboard(id: String, shapeCount: Int, shapesMap: scala.collection.immutable.Map[String, scala.collection.immutable.List[AnnotationVO]])

trait WhiteboardApp {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleSendWhiteboardAnnotationRequest(msg: SendWhiteboardAnnotationRequest) {
    var shape = msg.annotation
    val status = shape.status
    val shapeType = shape.shapeType
    val wbId = shape.wbId
    val userId = msg.requesterID

    //initWhiteboard(wbId)

    //    println("Received whiteboard shape. status=[" + status + "], shapeType=[" + shapeType + "]")

    if (WhiteboardKeyUtil.DRAW_START_STATUS == status) {
      liveMeeting.wbModel.addAnnotation(wbId, userId, shape)
    } else if (WhiteboardKeyUtil.DRAW_UPDATE_STATUS == status) {
      if (WhiteboardKeyUtil.PENCIL_TYPE == shapeType) {
        liveMeeting.wbModel.updateAnnotationPencil(wbId, userId, shape)
      } else {
        liveMeeting.wbModel.updateAnnotation(wbId, userId, shape)
      }
    } else if (WhiteboardKeyUtil.DRAW_END_STATUS == status) {
      if (WhiteboardKeyUtil.PENCIL_TYPE == shapeType) {
        shape = liveMeeting.wbModel.endAnnotationPencil(wbId, userId, shape)
      } else {
        liveMeeting.wbModel.updateAnnotation(wbId, userId, shape)
      }
    } else {
      //	    println("Received UNKNOWN whiteboard shape!!!!. status=[" + status + "], shapeType=[" + shapeType + "]")
    }
    if (liveMeeting.wbModel.hasWhiteboard(wbId)) {
      //        println("WhiteboardApp::handleSendWhiteboardAnnotationRequest - num shapes [" + wb.shapes.length + "]")
      outGW.send(new SendWhiteboardAnnotationEvent(mProps.meetingID, mProps.recorded, msg.requesterID, wbId, shape))
    }

  }

  def handleGetWhiteboardShapesRequest(msg: GetWhiteboardShapesRequest) {
    //println("WB: Received page history [" + msg.whiteboardId + "]")
    val history = liveMeeting.wbModel.getHistory(msg.whiteboardId);
    if (history.length > 0) {
      outGW.send(new GetWhiteboardShapesReply(mProps.meetingID, mProps.recorded, msg.requesterID, msg.whiteboardId, history, msg.replyTo))
    }
  }

  def handleClearWhiteboardRequest(msg: ClearWhiteboardRequest) {
    //println("WB: Received clear whiteboard")
    liveMeeting.wbModel.clearWhiteboard(msg.whiteboardId, msg.requesterID) foreach { fullClear =>
      outGW.send(new ClearWhiteboardEvent(mProps.meetingID, mProps.recorded, msg.requesterID, msg.whiteboardId, fullClear))
    }
  }

  def handleUndoWhiteboardRequest(msg: UndoWhiteboardRequest) {
    //    println("WB: Received undo whiteboard")
    liveMeeting.wbModel.undoWhiteboard(msg.whiteboardId, msg.requesterID) foreach { last =>
      outGW.send(new UndoWhiteboardEvent(mProps.meetingID, mProps.recorded, msg.requesterID, msg.whiteboardId, last.id))
    }
  }

  def handleModifyWhiteboardAccessRequest(msg: ModifyWhiteboardAccessRequest) {
    liveMeeting.wbModel.modifyWhiteboardAccess(msg.multiUser)
    outGW.send(new ModifiedWhiteboardAccessEvent(mProps.meetingID, mProps.recorded, msg.requesterID, msg.multiUser))
  }

  def handleGetWhiteboardAccessRequest(msg: GetWhiteboardAccessRequest) {
    val multiUser = liveMeeting.wbModel.getWhiteboardAccess()
    outGW.send(new GetWhiteboardAccessReply(mProps.meetingID, mProps.recorded, msg.requesterID, multiUser))
  }
}
