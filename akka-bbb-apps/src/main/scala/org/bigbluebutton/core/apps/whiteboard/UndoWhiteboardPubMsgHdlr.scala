package org.bigbluebutton.core.apps.whiteboard

import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait UndoWhiteboardPubMsgHdlr extends RightsManagementTrait {
  this: WhiteboardApp2x =>

  def handle(msg: UndoWhiteboardPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastEvent(msg: UndoWhiteboardPubMsg, removedAnnotationIds: List[String], addedAnnotations: List[AnnotationVO]): Unit = {
      val routing = Routing.addMsgToHtml5InstanceIdRouting(liveMeeting.props.meetingProp.intId, liveMeeting.props.systemProps.html5InstanceId.toString)
      val envelope = BbbCoreEnvelope(ModifyWhiteboardAnnotationEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(ModifyWhiteboardAnnotationEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = ModifyWhiteboardAnnotationEvtMsgBody(addedAnnotations, removedAnnotationIds, msg.header.userId, msg.body.whiteboardId, "undo")
      val event = ModifyWhiteboardAnnotationEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    if (filterWhiteboardMessage(msg.body.whiteboardId, msg.header.userId, liveMeeting) && permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      if (isNonEjectionGracePeriodOver(msg.body.whiteboardId, msg.header.userId, liveMeeting)) {
        val meetingId = liveMeeting.props.meetingProp.intId
        val reason = "No permission to undo an annotation."
        PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
      }
    } else {
      undoWhiteboard(msg.body.whiteboardId, msg.header.userId, liveMeeting) match {
        case Some(ann: AnnotationVO)   => broadcastEvent(msg, List(ann.id), List())
        //remove addedAnnotations and add removed Annotations because of undo
        case Some(mod: ModificationVO) => broadcastEvent(msg, mod.addedAnnotations.map { case a => a.id }, mod.removedAnnotations.map { case (a, _) => a })
        case _                         =>
      }
    }
  }
}
