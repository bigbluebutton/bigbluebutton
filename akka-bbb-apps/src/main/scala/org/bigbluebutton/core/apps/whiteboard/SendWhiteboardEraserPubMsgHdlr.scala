package org.bigbluebutton.core.apps.whiteboard

import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait, WhiteboardKeyUtil }
import scala.collection.immutable.{ Map, List }

trait SendWhiteboardEraserPubMsgHdlr extends RightsManagementTrait {
  this: WhiteboardApp2x =>

  def handle(msg: SendWhiteboardEraserPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastEvent(msg: SendWhiteboardEraserPubMsg, eraserMap: Map[String, Any]): Unit = {
      val routing = Routing.addMsgToHtml5InstanceIdRouting(liveMeeting.props.meetingProp.intId, liveMeeting.props.systemProps.html5InstanceId.toString)
      val envelope = BbbCoreEnvelope(SendWhiteboardEraserEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(SendWhiteboardEraserEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      // start body
      // whiteboardId, userId, eraserId, annotationsToAdd, idsToRemove
      val body = SendWhiteboardEraserEvtMsgBody(
        eraserMap.get("whiteboardId") match {
          case Some(value: String) => value
          case _ => {
            log.warning("Eraser Map has no whiteboardId value")
            msg.body.annotation.wbId
          }
        },
        eraserMap.get("userId") match {
          case Some(value: String) => value
          case _ => {
            log.warning("Eraser Map has no userId value")
            msg.body.annotation.userId
          }
        },
        eraserMap.get("eraserId") match {
          case Some(value: String) => value
          case _ => {
            log.warning("Eraser Map has no eraserId value")
            msg.body.annotation.id
          }
        },
        eraserMap.get("annotationsToAdd") match {
          case Some(value: List[AnnotationVO]) => value
          case _ => {
            log.warning("Eraser Map has no annotationsToAdd value")
            List()
          }
        },
        eraserMap.get("idsToRemove") match {
          case Some(value: List[String]) => value
          case _ => {
            log.warning("Eraser Map has no idsToRemove value")
            List()
          }
        }
      )
      //end body

      val event = SendWhiteboardEraserEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    def sanitizeAnnotation(annotation: AnnotationVO): AnnotationVO = {
      // Remove null values by wrapping value with Option. Null becomes None.
      val shape = annotation.annotationInfo.collect {
        case (key, value: Any) => key -> Option(value)
      }

      //printAnnotationShape(shape, annotation)

      if (annotation.annotationInfo.values.exists(p => if (p == null) true else false)) {
        log.warning("Whiteboard shape contains null values. " + annotation.toString)
      }

      // Unwrap the value wrapped as Option
      val shape2 = shape.collect {
        case (key, Some(value)) => key -> value
      }

      annotation.copy(annotationInfo = shape2)
    }

    // For testing
    def testInsertSomeNoneValues(annotation: AnnotationVO): AnnotationVO = {
      val c = annotation.annotationInfo + ("AR" -> "", "AZ" -> null, "foo" -> null)
      annotation.copy(annotationInfo = c)
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

    def excludedWbMsg(annotation: AnnotationVO): Boolean = {
      WhiteboardKeyUtil.PENCIL_TYPE == annotation.annotationType &&
        (WhiteboardKeyUtil.DRAW_END_STATUS == annotation.status ||
          WhiteboardKeyUtil.DRAW_UPDATE_STATUS == annotation.status)
    }

    if (!excludedWbMsg(msg.body.annotation) && filterWhiteboardMessage(msg.body.annotation.wbId, msg.header.userId, liveMeeting) && permissionFailed(
      PermissionCheck.GUEST_LEVEL,
      PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId
    )) {
      //val meetingId = liveMeeting.props.meetingProp.intId
      //val reason = "No permission to send a whiteboard annotation."

      // Just drop messages as these might be delayed messages from multi-user whiteboard. Don't want to
      // eject user unnecessarily when switching from multi-user to single user. (ralam feb 7, 2018)
      // PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    } else {
      //val dirtyAnn = testInsertSomeNoneValues(msg.body.annotation)
      //println(">>>>>>>>>>>>> Printing Dirty annotation >>>>>>>>>>>>>>")
      //val dirtyAnn2 = printAnnotationInfo(dirtyAnn)
      //println(">>>>>>>>>>>>> Printed Dirty annotation  >>>>>>>>>>>>>>")

      // Sometimes, we get null values for some of our whiteboard shapes. We need to
      // weed these out so as not to cause any problems to other components. We've
      // seen where the null values killed the RecorderActor when trying to write to redis.
      // ralam april 11, 2019
      val sanitizedShape = sanitizeAnnotation(msg.body.annotation)
      //println("============= Printing Sanitized annotation ============")
      //printAnnotationInfo(sanitizedShape)
      //println("============= Printed Sanitized annotation  ============")
      val eraserMap = sendWhiteboardEraser(sanitizedShape, msg.body.drawEndOnly, liveMeeting)
      broadcastEvent(msg, eraserMap)
    }
  }
}
