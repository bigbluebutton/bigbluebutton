package org.bigbluebutton.core.apps

import scala.collection.immutable.HashMap
import org.bigbluebutton.common2.msgs.AnnotationVO
import org.bigbluebutton.core.apps.whiteboard.Whiteboard
import org.bigbluebutton.SystemConfiguration

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

  def addAnnotations(wbId: String, userId: String, annotations: Array[AnnotationVO], isPresenter: Boolean, isModerator: Boolean): Array[AnnotationVO] = {
    var annotationsAdded = Array[AnnotationVO]()
    val wb = getWhiteboard(wbId)
    var newAnnotationsMap = wb.annotationsMap
    for (annotation <- annotations) {
      val oldAnnotation = wb.annotationsMap.get(annotation.id)
      if (!oldAnnotation.isEmpty) {
        val hasPermission = isPresenter || isModerator || oldAnnotation.get.userId == userId
        if (hasPermission) {
          val newAnnotation = oldAnnotation.get.copy(annotationInfo = deepMerge(oldAnnotation.get.annotationInfo, annotation.annotationInfo))
          newAnnotationsMap += (annotation.id -> newAnnotation)
          annotationsAdded :+= annotation
          println(s"Updated annotation onpage [${wb.id}]. After numAnnotations=[${newAnnotationsMap.size}].")
        } else {
          println(s"User $userId doesn't have permission to edit annotation ${annotation.id}, ignoring...")
        }
      } else if (annotation.annotationInfo.contains("type")) {
        newAnnotationsMap += (annotation.id -> annotation)
        annotationsAdded :+= annotation
        println(s"Adding annotation to page [${wb.id}]. After numAnnotations=[${newAnnotationsMap.size}].")
      } else {
        println(s"New annotation [${annotation.id}] with no type, ignoring (probably received a remove message before and now the shape is incomplete, ignoring...")
      }
    }
    val newWb = wb.copy(annotationsMap = newAnnotationsMap)
    saveWhiteboard(newWb)
    annotationsAdded
  }

  def getHistory(wbId: String): Array[AnnotationVO] = {
    val wb = getWhiteboard(wbId)
    wb.annotationsMap.values.toArray
  }

  def deleteAnnotations(wbId: String, userId: String, annotationsIds: Array[String], isPresenter: Boolean, isModerator: Boolean): Array[String] = {
    var annotationsIdsRemoved = Array[String]()
    val wb = getWhiteboard(wbId)
    var newAnnotationsMap = wb.annotationsMap

    for (annotationId <- annotationsIds) {
      val annotation = wb.annotationsMap.get(annotationId)

      if (!annotation.isEmpty) {
        val hasPermission = isPresenter || isModerator || annotation.get.userId == userId
        if (hasPermission) {
          newAnnotationsMap -= annotationId
          println("Removing annotation on page [" + wb.id + "]. After numAnnotations=[" + newAnnotationsMap.size + "].")
          annotationsIdsRemoved :+= annotationId
        } else {
          println("User doesn't have permission to remove this annotation, ignoring...")
        }
      }
    }
    val newWb = wb.copy(annotationsMap = newAnnotationsMap)
    saveWhiteboard(newWb)
    annotationsIdsRemoved
  }

  def modifyWhiteboardAccess(wbId: String, multiUser: Array[String]) {
    val wb = getWhiteboard(wbId)
    val newWb = wb.copy(multiUser = multiUser, oldMultiUser = wb.multiUser, changedModeOn = System.currentTimeMillis())
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
