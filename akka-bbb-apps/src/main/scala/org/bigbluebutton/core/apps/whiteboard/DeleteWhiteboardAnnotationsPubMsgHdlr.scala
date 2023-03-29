package org.bigbluebutton.core.apps.whiteboard

import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait DeleteWhiteboardAnnotationsPubMsgHdlr extends RightsManagementTrait {
  this: WhiteboardApp2x =>

  def handle(msg: DeleteWhiteboardAnnotationsPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastEvent(msg: DeleteWhiteboardAnnotationsPubMsg, removedAnnotationsIds: Array[String]): Unit = {
      val routing = Routing.addMsgToHtml5InstanceIdRouting(liveMeeting.props.meetingProp.intId, liveMeeting.props.systemProps.html5InstanceId.toString)
      val envelope = BbbCoreEnvelope(DeleteWhiteboardAnnotationsEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(DeleteWhiteboardAnnotationsEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = DeleteWhiteboardAnnotationsEvtMsgBody(msg.body.whiteboardId, removedAnnotationsIds)
      val event = DeleteWhiteboardAnnotationsEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    val isUserAmongPresenters = !permissionFailed(
      PermissionCheck.GUEST_LEVEL,
      PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId
    )

    val isUserModerator = !permissionFailed(
      PermissionCheck.MOD_LEVEL,
      PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId
    )

    if (filterWhiteboardMessage(msg.body.whiteboardId, msg.header.userId, liveMeeting) && !isUserAmongPresenters) {
      if (isNonEjectionGracePeriodOver(msg.body.whiteboardId, msg.header.userId, liveMeeting)) {
        val meetingId = liveMeeting.props.meetingProp.intId
        val reason = "No permission to delete an annotation."
        PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
      }
    } else {
      val deletedAnnotations = deleteWhiteboardAnnotations(msg.body.whiteboardId, msg.header.userId, msg.body.annotationsIds, liveMeeting, isUserAmongPresenters, isUserModerator)
      if (!deletedAnnotations.isEmpty) {
        broadcastEvent(msg, deletedAnnotations)
      }
    }
  }
}
