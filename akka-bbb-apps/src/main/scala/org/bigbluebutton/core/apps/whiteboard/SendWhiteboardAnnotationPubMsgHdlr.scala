package org.bigbluebutton.core.apps.whiteboard

import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait, WhiteboardKeyUtil }

trait SendWhiteboardAnnotationPubMsgHdlr extends RightsManagementTrait {
  this: WhiteboardApp2x =>

  def handle(msg: SendWhiteboardAnnotationPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastEvent(msg: SendWhiteboardAnnotationPubMsg, annotation: AnnotationVO): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(SendWhiteboardAnnotationEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(SendWhiteboardAnnotationEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = SendWhiteboardAnnotationEvtMsgBody(annotation)
      val event = SendWhiteboardAnnotationEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    def excludedWbMsg(annotation: AnnotationVO): Boolean = {
      WhiteboardKeyUtil.PENCIL_TYPE == annotation.annotationType &&
        (WhiteboardKeyUtil.DRAW_END_STATUS == annotation.status ||
          WhiteboardKeyUtil.DRAW_UPDATE_STATUS == annotation.status)
    }

    if (!excludedWbMsg(msg.body.annotation) && filterWhiteboardMessage(msg.body.annotation.wbId, liveMeeting) && permissionFailed(
      PermissionCheck.GUEST_LEVEL,
      PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId
    )) {
      //val meetingId = liveMeeting.props.meetingProp.intId
      //val reason = "No permission to send a whiteboard annotation."

      // Just drop messages as these might be delayed messages from multi-user whiteboard. Don't want to
      // eject user unnecessarily when switching from multi-user to single user. (ralam feb 7, 2018)
      // PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    } else {
      val annotation = sendWhiteboardAnnotation(msg.body.annotation, liveMeeting)
      broadcastEvent(msg, annotation)
    }
  }
}
