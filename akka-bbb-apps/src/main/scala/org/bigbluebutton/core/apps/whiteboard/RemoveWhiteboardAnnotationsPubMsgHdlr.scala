package org.bigbluebutton.core.apps.whiteboard

import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait RemoveWhiteboardAnnotationsPubMsgHdlr extends RightsManagementTrait {
  this: WhiteboardApp2x =>

  def handle(msg: RemoveWhiteboardAnnotationsPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastEvent(msg: RemoveWhiteboardAnnotationsPubMsg, removedAnnotationId: String): Unit = {
      val routing = Routing.addMsgToHtml5InstanceIdRouting(liveMeeting.props.meetingProp.intId, liveMeeting.props.systemProps.html5InstanceId.toString)
      val envelope = BbbCoreEnvelope(RemoveWhiteboardAnnotationsEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(RemoveWhiteboardAnnotationsEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = RemoveWhiteboardAnnotationsEvtMsgBody(msg.body.whiteboardId, msg.body.selectedAnnotations, msg.header.userId, removedAnnotationId)
      val event = RemoveWhiteboardAnnotationsEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    if (filterWhiteboardMessage(msg.body.whiteboardId, msg.header.userId, liveMeeting) && permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to remove an annotation."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    } else {
      for {
        lastAnnotation <- removeWhiteboardAnnotations(msg.body.whiteboardId, msg.body.selectedAnnotations, msg.header.userId, liveMeeting)
      } yield {
        broadcastEvent(msg, lastAnnotation.id)
      }
    }
  }
}
