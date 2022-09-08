package org.bigbluebutton.core.apps

import org.bigbluebutton.core.util.jhotdraw.BezierWrapper
import scala.collection.immutable.List
import scala.collection.immutable.HashMap
import scala.collection.JavaConverters._
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
    new Whiteboard(
      wbId,
      Array.empty[String],
      Array.empty[String],
      System.currentTimeMillis(),
      new HashMap[String, Map[String, AnnotationVO]]()
    )
  }

  private def getAnnotationsByUserId(wb: Whiteboard, id: String): Map[String, AnnotationVO] = {
    wb.annotationsMap.get(id).getOrElse(Map[String, AnnotationVO]())
  }

  def addAnnotations(wbId: String, userId: String, annotations: Array[AnnotationVO]): Array[AnnotationVO] = {
    val wb = getWhiteboard(wbId)
    val usersAnnotations = getAnnotationsByUserId(wb, userId)
    var newUserAnnotations = usersAnnotations
    for (annotation <- annotations) {
      newUserAnnotations = newUserAnnotations + (annotation.id -> annotation)
      println("Adding annotation to page [" + wb.id + "]. After numAnnotations=[" + newUserAnnotations.size + "].")
    }
    val newAnnotationsMap = wb.annotationsMap + (userId -> newUserAnnotations)
    val newWb = wb.copy(annotationsMap = newAnnotationsMap)
    saveWhiteboard(newWb)
    annotations
  }

  def getHistory(wbId: String): Array[AnnotationVO] = {
    //wb.annotationsMap.values.flatten.toArray.sortBy(_.position);
    val wb = getWhiteboard(wbId)
    var annotations = Array[AnnotationVO]()
    // TODO: revisit this, probably there is a one-liner simple solution
    wb.annotationsMap.values.foreach(
      user => user.values.foreach(
        annotation => annotations = annotations :+ annotation
      )
    )
    annotations
  }

  def clearWhiteboard(wbId: String, userId: String): Option[Boolean] = {
    var cleared: Option[Boolean] = None

    if (hasWhiteboard(wbId)) {
      val wb = getWhiteboard(wbId)

      if (wb.multiUser.contains(userId)) {
        if (wb.annotationsMap.contains(userId)) {
          val newWb = wb.copy(annotationsMap = wb.annotationsMap - userId)
          saveWhiteboard(newWb)
          cleared = Some(false)
        }
      } else {
        if (wb.annotationsMap.nonEmpty) {
          val newWb = wb.copy(annotationsMap = new HashMap[String, Map[String, AnnotationVO]]())
          saveWhiteboard(newWb)
          cleared = Some(true)
        }
      }
    }
    cleared
  }

  def deleteAnnotations(wbId: String, userId: String, annotationsIds: Array[String]): Array[String] = {
    var annotationsIdsRemoved = Array[String]()
    val wb = getWhiteboard(wbId)

    val usersAnnotations = getAnnotationsByUserId(wb, userId)
    var newUserAnnotations = usersAnnotations
    for (annotationId <- annotationsIds) {
      val annotation = usersAnnotations.get(annotationId)

      //not empty and annotation exists
      if (!usersAnnotations.isEmpty && !annotation.isEmpty) {
        newUserAnnotations = newUserAnnotations - annotationId
        println("Removing annotation on page [" + wb.id + "]. After numAnnotations=[" + newUserAnnotations.size + "].")
        annotationsIdsRemoved = annotationsIdsRemoved :+ annotationId
      }
    }
    val newAnnotationsMap = wb.annotationsMap + (userId -> newUserAnnotations)
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
