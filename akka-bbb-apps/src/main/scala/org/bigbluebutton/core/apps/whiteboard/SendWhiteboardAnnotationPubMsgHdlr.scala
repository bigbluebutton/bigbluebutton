package org.bigbluebutton.core.apps.whiteboard

import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait SendWhiteboardAnnotationsPubMsgHdlr extends RightsManagementTrait {
  this: WhiteboardApp2x =>

  def handle(msg: SendWhiteboardAnnotationsPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastEvent(msg: SendWhiteboardAnnotationsPubMsg, whiteboardId: String, annotations: Array[AnnotationVO], html5InstanceId: String): Unit = {
      val routing = Routing.addMsgToHtml5InstanceIdRouting(liveMeeting.props.meetingProp.intId, html5InstanceId)
      val envelope = BbbCoreEnvelope(SendWhiteboardAnnotationsEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(SendWhiteboardAnnotationsEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = SendWhiteboardAnnotationsEvtMsgBody(whiteboardId, annotations)
      val event = SendWhiteboardAnnotationsEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    // For testing
    def printAnnotationShape(annotationInfo: scala.collection.immutable.Map[String, Any], annotation: AnnotationVO): AnnotationVO = {
      println("************* Printing Shape annotation *************")
      annotationInfo.foreach { an =>
        println("*** key=" + an._1 + ",  value=" + an._2)
      }
      println("************* Printing Shape annotation *************")
      annotation
    }

    // For testing
    def printAnnotationInfo(annotation: AnnotationVO): AnnotationVO = {
      annotation.annotationInfo.foreach { an =>
        println(">>> key=" + an._1 + ", value=" + an._2)
      }
      annotation
    }

    val isUserOneOfPermited = !filterWhiteboardMessage(msg.body.whiteboardId, msg.header.userId, liveMeeting)

    val isUserAmongPresenters = !permissionFailed(
      PermissionCheck.GUEST_LEVEL,
      PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId
    )

    val isUserModerator = !permissionFailed(
      PermissionCheck.MOD_LEVEL,
      PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId
    )

    if (isUserOneOfPermited || isUserAmongPresenters) {
      println("============= Printing Sanitized annotations ============")
      for (annotation <- msg.body.annotations) {
        printAnnotationInfo(annotation)
      }
      println("============= Printed Sanitized annotations  ============")
      val annotations = sendWhiteboardAnnotations(msg.body.whiteboardId, msg.header.userId, msg.body.annotations, liveMeeting, isUserAmongPresenters, isUserModerator)
      broadcastEvent(msg, msg.body.whiteboardId, annotations, msg.body.html5InstanceId)
    } else {
      //val meetingId = liveMeeting.props.meetingProp.intId
      //val reason = "No permission to send a whiteboard annotation."

      // Just drop messages as these might be delayed messages from multi-user whiteboard. Don't want to
      // eject user unnecessarily when switching from multi-user to single user. (ralam feb 7, 2018)
      // PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    }
  }
}
