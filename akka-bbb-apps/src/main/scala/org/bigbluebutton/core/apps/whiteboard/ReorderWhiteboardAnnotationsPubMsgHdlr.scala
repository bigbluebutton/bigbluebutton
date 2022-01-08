package org.bigbluebutton.core.apps.whiteboard

import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait ReorderWhiteboardAnnotationsPubMsgHdlr extends RightsManagementTrait {
  this: WhiteboardApp2x =>

  def handle(msg: ReorderWhiteboardAnnotationsPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastEvent(msg: ReorderWhiteboardAnnotationsPubMsg): Unit = {
      val routing = Routing.addMsgToHtml5InstanceIdRouting(liveMeeting.props.meetingProp.intId, liveMeeting.props.systemProps.html5InstanceId.toString)
      val envelope = BbbCoreEnvelope(ReorderWhiteboardAnnotationsEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(ReorderWhiteboardAnnotationsEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = ReorderWhiteboardAnnotationsEvtMsgBody(msg.body.whiteboardId, msg.body.selectedAnnotations, msg.body.order, msg.header.userId)
      val event = ReorderWhiteboardAnnotationsEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    if (filterWhiteboardMessage(msg.body.whiteboardId, msg.header.userId, liveMeeting) && permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to reorder annotations."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    } else {
      reorderWhiteboardAnnotations(msg.body.whiteboardId, msg.body.selectedAnnotations, msg.body.order, msg.header.userId, liveMeeting)
      broadcastEvent(msg)
    }
  }
}
