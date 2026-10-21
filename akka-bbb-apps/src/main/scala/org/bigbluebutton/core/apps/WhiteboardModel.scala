package org.bigbluebutton.core.apps

import scala.collection.immutable.HashMap
import org.bigbluebutton.common2.msgs.AnnotationVO
import org.bigbluebutton.core.apps.whiteboard.Whiteboard
import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.core.db.{ PresAnnotationDAO, PresAnnotationHistoryDAO }

object WhiteboardModel {
  // Shape types that must never be stored or broadcast as whiteboard
  // annotations. They render embeddable/rich content (iframes, link
  // previews, external images) instead of being part of the drawing
  // toolset, so they are rejected server-side regardless of any
  // client-side checks. Mirrors the client allowlist (isValidShapeType).
  val DisallowedAnnotationTypes: Set[String] = Set("embed", "bookmark", "image")

  def isAllowedAnnotationType(annotationInfo: Map[String, _]): Boolean = {
    annotationInfo.get("type") match {
      case Some(annotationType: String) => !DisallowedAnnotationTypes.contains(annotationType)
      case _                            => true
    }
  }

  // Bind the annotation author to the authenticated requester rather than
  // trusting the client-supplied annotation.userId. Without this a participant
  // could submit an annotation carrying another participant's (or a fabricated)
  // userId and have it stored and broadcast under that identity. The requester
  // id is the server-side session identity resolved by the handler, so it is
  // the authoritative owner. Lives in the companion object so it is unit
  // testable without instantiating the model.
  def bindAnnotationAuthor(annotation: AnnotationVO, requesterId: String): AnnotationVO =
    annotation.copy(userId = requesterId)

  // The tldraw shape also carries its own creator marker in
  // annotationInfo.meta.createdBy, which the client uses to decide who may
  // select and edit the shape. Bind it to the requester on creation for the
  // same reason as the top-level userId; a legitimate client always sends its
  // own id, so this is a no-op for real drawing. Left untouched when absent.
  def bindAnnotationCreator(annotationInfo: Map[String, Any], requesterId: String): Map[String, Any] =
    annotationInfo.get("meta") match {
      case Some(meta: Map[String, Any] @unchecked) if meta.contains("createdBy") =>
        annotationInfo.updated("meta", meta.updated("createdBy", requesterId))
      case _ => annotationInfo
    }

  // On update the creator marker is immutable: any client-supplied
  // meta.createdBy is rebound to the original creator (or the stored author
  // when the original had none), so an editor cannot re-attribute a shape.
  def preserveAnnotationCreator(oldAnnotation: AnnotationVO, newInfo: Map[String, Any]): Map[String, Any] = {
    val originalCreator = oldAnnotation.annotationInfo.get("meta") match {
      case Some(meta: Map[String, Any] @unchecked) => meta.get("createdBy").map(_.toString)
      case _                                       => None
    }
    bindAnnotationCreator(newInfo, originalCreator.getOrElse(oldAnnotation.userId))
  }
}

class WhiteboardModel extends SystemConfiguration {
  import WhiteboardModel.{ bindAnnotationAuthor, bindAnnotationCreator, isAllowedAnnotationType, preserveAnnotationCreator }

  private var _whiteboards = new HashMap[String, Whiteboard]()

  private def saveWhiteboard(wb: Whiteboard) {
    _whiteboards += wb.id -> wb
  }

  def getWhiteboard(id: String): Whiteboard = {
    _whiteboards.get(id).getOrElse(createWhiteboard(id))
  }

  def hasWhiteboard(id: String): Boolean = {
    _whiteboards.contains(id)
  }

  private def createWhiteboard(wbId: String): Whiteboard = {
    Whiteboard(
      wbId,
      new HashMap[String, AnnotationVO]
    )
  }

  private def deepMerge(test: Map[String, _], that: Map[String, _]): Map[String, _] =
    (for (k <- test.keys ++ that.keys) yield {
      val newValue =
        (test.get(k), that.get(k)) match {
          case (Some(v), None) => v
          case (None, Some(v)) => v
          case (Some(v1), Some(v2)) =>
            if (v1.isInstanceOf[Map[String, _]] && v2.isInstanceOf[Map[String, _]])
              deepMerge(v1.asInstanceOf[Map[String, _]], v2.asInstanceOf[Map[String, _]])
            else v2
          case (_, _) => ???
        }
      k -> newValue
    }).toMap

  def addAnnotations(wbId: String, meetingId: String, userId: String, annotations: Array[AnnotationVO], isPresenter: Boolean, isModerator: Boolean): Array[AnnotationVO] = {

    val wb = getWhiteboard(wbId)

    var annotationsAdded = Array[AnnotationVO]()
    var annotationsDiffAdded = Array[AnnotationVO]()
    var newAnnotationsMap = wb.annotationsMap

    for (rawAnnotation <- annotations) {
      // Author is always the authenticated requester, never the client-supplied
      // annotation.userId (see WhiteboardModel.bindAnnotationAuthor).
      val annotation = bindAnnotationAuthor(rawAnnotation, userId)
      val oldAnnotation = wb.annotationsMap.get(annotation.id)
      if (oldAnnotation.isDefined) {
        val hasPermission = isPresenter || isModerator || oldAnnotation.get.userId == userId
        if (hasPermission) {
          val mergedAnnotationInfo = deepMerge(oldAnnotation.get.annotationInfo, annotation.annotationInfo)

          // Apply cleaning if it's an arrow annotation
          val cleanedAnnotationInfo = if (oldAnnotation.get.annotationInfo.get("type").contains("arrow")) {
            cleanArrowAnnotationProps(mergedAnnotationInfo)
          } else {
            mergedAnnotationInfo
          }
          val finalAnnotationInfo = preserveAnnotationCreator(oldAnnotation.get, cleanedAnnotationInfo)

          if (isAllowedAnnotationType(finalAnnotationInfo)) {
            val newAnnotation = oldAnnotation.get.copy(annotationInfo = finalAnnotationInfo)
            newAnnotationsMap += (annotation.id -> newAnnotation)
            annotationsAdded :+= newAnnotation
            annotationsDiffAdded :+= annotation.copy(annotationInfo = preserveAnnotationCreator(oldAnnotation.get, annotation.annotationInfo))
            println(s"Updated annotation on page [${wb.id}]. After numAnnotations=[${newAnnotationsMap.size}].")
          } else {
            println(s"Rejected update of annotation ${annotation.id} with disallowed type on page [${wb.id}], ignoring...")
          }
        } else {
          println(s"User $userId doesn't have permission to edit annotation ${annotation.id}, ignoring...")
        }
      } else if (annotation.annotationInfo.contains("type")) {
        if (isAllowedAnnotationType(annotation.annotationInfo)) {
          val newAnnotation = annotation.copy(annotationInfo = bindAnnotationCreator(annotation.annotationInfo, userId))
          newAnnotationsMap += (annotation.id -> newAnnotation)
          annotationsAdded :+= newAnnotation
          annotationsDiffAdded :+= newAnnotation
          println(s"Adding annotation to page [${wb.id}]. After numAnnotations=[${newAnnotationsMap.size}].")
        } else {
          println(s"Rejected annotation ${annotation.id} with disallowed type on page [${wb.id}], ignoring...")
        }
      } else {
        println(s"New annotation [${annotation.id}] with no type, ignoring...")
      }
    }

    val annotationUpdatedAt = System.currentTimeMillis()
    PresAnnotationHistoryDAO.insertOrUpdateMap(meetingId, annotationsDiffAdded, annotationUpdatedAt)
    PresAnnotationDAO.insertOrUpdateMap(meetingId, annotationsAdded, annotationUpdatedAt)

    val newWb = wb.copy(annotationsMap = newAnnotationsMap)
    saveWhiteboard(newWb)
    annotationsDiffAdded
  }

  private def overwriteLineShapeHandles(oldProps: Map[String, Any], newProps: Map[String, Any]): Map[String, Any] = {
    val newHandles = newProps.get("handles")
    val updatedProps = oldProps ++ newProps.filter {
      case ("handles", _) => false // Remove the old handles
      case _              => true
    }
    updatedProps ++ newHandles.map("handles" -> _)
  }

  private def cleanArrowAnnotationProps(annotationInfo: Map[String, _]): Map[String, _] = {
    annotationInfo.get("props") match {
      case Some(props: Map[String, _]) =>
        val cleanedProps = props.map {
          case ("end", endProps: Map[String, _])     => "end" -> cleanEndOrStartProps(endProps)
          case ("start", startProps: Map[String, _]) => "start" -> cleanEndOrStartProps(startProps)
          case other                                 => other
        }
        annotationInfo + ("props" -> cleanedProps)
      case _ => annotationInfo
    }
  }

  private def cleanEndOrStartProps(props: Map[String, _]): Map[String, _] = {
    props.get("type") match {
      case Some("binding") => props - ("x", "y") // Remove 'x' and 'y' for 'binding' type
      case Some("point")   => props - ("boundShapeId", "normalizedAnchor", "isExact", "isPrecise") // Remove unwanted properties for 'point' type
      case _               => props
    }
  }

  def getHistory(wbId: String): Array[AnnotationVO] = {
    val wb = getWhiteboard(wbId)
    wb.annotationsMap.values.toArray
  }

  def deleteAnnotations(wbId: String, meetingId: String, userId: String, annotationsIds: Array[String], isPresenter: Boolean, isModerator: Boolean): Array[String] = {
    val wb = getWhiteboard(wbId)

    var annotationsIdsRemoved = Array[String]()
    var newAnnotationsMap = wb.annotationsMap

    for (annotationId <- annotationsIds) {
      val annotation = wb.annotationsMap.get(annotationId)

      if (annotation.isDefined) {
        val hasPermission = isPresenter || isModerator || annotation.get.userId == userId
        if (hasPermission) {
          newAnnotationsMap -= annotationId
          println(s"Removed annotation $annotationId on page [${wb.id}]. After numAnnotations=[${newAnnotationsMap.size}].")
          annotationsIdsRemoved :+= annotationId
        } else {
          println(s"User $userId doesn't have permission to remove annotation $annotationId, ignoring...")
        }
      } else {
        println(s"Annotation $annotationId not found while trying to delete it.")
      }
    }

    // Update whiteboard and save
    val updatedWb = wb.copy(annotationsMap = newAnnotationsMap)
    saveWhiteboard(updatedWb)

    val annotationUpdatedAt = System.currentTimeMillis()
    PresAnnotationHistoryDAO.deleteAnnotations(meetingId, wb.id, userId, annotationsIdsRemoved, annotationUpdatedAt)
    PresAnnotationDAO.deleteAnnotations(meetingId, wb.id, userId, annotationsIdsRemoved, annotationUpdatedAt)

    annotationsIdsRemoved
  }
}
