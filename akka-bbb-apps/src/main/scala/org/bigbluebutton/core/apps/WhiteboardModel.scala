package org.bigbluebutton.core.apps

import scala.collection.immutable.HashMap
import org.bigbluebutton.common2.msgs.AnnotationVO
import org.bigbluebutton.core.apps.whiteboard.Whiteboard
import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.core.db.{ PresAnnotationDAO, PresPageWritersDAO }

class WhiteboardModel extends SystemConfiguration {
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
      Array.empty[String],
      Array.empty[String],
      System.currentTimeMillis(),
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
    var newAnnotationsMap = wb.annotationsMap

    for (annotation <- annotations) {
      val oldAnnotation = wb.annotationsMap.get(annotation.id)
      if (!oldAnnotation.isEmpty) {
        val hasPermission = isPresenter || isModerator || oldAnnotation.get.userId == userId
        if (hasPermission) {
          // Merge old and new annotation properties
          val mergedAnnotationInfo = deepMerge(oldAnnotation.get.annotationInfo, annotation.annotationInfo)

          // Apply cleaning if it's an arrow annotation
          val finalAnnotationInfo = if (annotation.annotationInfo.get("type").contains("arrow")) {
            cleanArrowAnnotationProps(mergedAnnotationInfo)
          } else {
            mergedAnnotationInfo
          }

          val newAnnotation = oldAnnotation.get.copy(annotationInfo = finalAnnotationInfo)
          newAnnotationsMap += (annotation.id -> newAnnotation)
          annotationsAdded :+= newAnnotation
          println(s"Updated annotation on page [${wb.id}]. After numAnnotations=[${newAnnotationsMap.size}].")
        } else {
          println(s"User $userId doesn't have permission to edit annotation ${annotation.id}, ignoring...")
        }
      } else if (annotation.annotationInfo.contains("type")) {
        newAnnotationsMap += (annotation.id -> annotation)
        annotationsAdded :+= annotation
        println(s"Adding annotation to page [${wb.id}]. After numAnnotations=[${newAnnotationsMap.size}].")
      } else {
        println(s"New annotation [${annotation.id}] with no type, ignoring...")
      }
    }

    PresAnnotationDAO.insertOrUpdateMap(meetingId, annotationsAdded)

    val newWb = wb.copy(annotationsMap = newAnnotationsMap)
    saveWhiteboard(newWb)
    annotationsAdded
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

    PresAnnotationDAO.delete(meetingId, userId, annotationsIdsRemoved)

    annotationsIdsRemoved
  }

  def modifyWhiteboardAccess(meetingId: String, wbId: String, multiUser: Array[String]) {
    val wb = getWhiteboard(wbId)
    val newWb = wb.copy(multiUser = multiUser, oldMultiUser = wb.multiUser, changedModeOn = System.currentTimeMillis())
    PresPageWritersDAO.updateMultiuser(meetingId, newWb)
    saveWhiteboard(newWb)
  }

  def getWhiteboardAccess(wbId: String): Array[String] = getWhiteboard(wbId).multiUser

  def isNonEjectionGracePeriodOver(wbId: String, userId: String): Boolean = {
    val wb = getWhiteboard(wbId)
    val lastChange = System.currentTimeMillis() - wb.changedModeOn
    !(wb.oldMultiUser.contains(userId) && lastChange < 5000)
  }

  def hasWhiteboardAccess(wbId: String, userId: String): Boolean = {
    val wb = getWhiteboard(wbId)
    wb.multiUser.contains(userId)
  }

  def getChangedModeOn(wbId: String): Long = getWhiteboard(wbId).changedModeOn
}