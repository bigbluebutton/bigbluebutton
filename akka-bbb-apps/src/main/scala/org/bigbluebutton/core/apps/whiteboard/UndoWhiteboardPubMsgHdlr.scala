package org.bigbluebutton.core.apps.whiteboard

import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait UndoWhiteboardPubMsgHdlr extends RightsManagementTrait {
  this: WhiteboardApp2x =>

  def handle(msg: UndoWhiteboardPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastEvent(msg: UndoWhiteboardPubMsg, removedAnnotationId: String): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(UndoWhiteboardEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(UndoWhiteboardEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = UndoWhiteboardEvtMsgBody(msg.body.whiteboardId, msg.header.userId, removedAnnotationId)
      val event = UndoWhiteboardEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    if (filterWhiteboardMessage(msg.body.whiteboardId, liveMeeting) && permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to undo an annotation."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    } else {
      for {
        lastAnnotation <- undoWhiteboard(msg.body.whiteboardId, msg.header.userId, liveMeeting)
      } yield {
        broadcastEvent(msg, lastAnnotation.id)
      }
    }
  }
}
