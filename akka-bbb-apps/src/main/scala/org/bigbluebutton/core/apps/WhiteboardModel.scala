package org.bigbluebutton.core.apps

//import java.util.ArrayList;
import org.bigbluebutton.core.util.jhotdraw.BezierWrapper
import scala.collection.immutable.List
import scala.collection.immutable.HashMap
import scala.collection.JavaConverters._
import org.bigbluebutton.common2.msgs.AnnotationVO
import org.bigbluebutton.core.apps.whiteboard.Whiteboard
import org.bigbluebutton.SystemConfiguration

class WhiteboardModel extends SystemConfiguration {
  private var _whiteboards = new HashMap[String, Whiteboard]()
  private var SYNCUPDATE = false
  private var SIMPLEPEN = true
  
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
      0,
      new HashMap[String, List[AnnotationVO]]()
    )
  }

  private def getAnnotationsByUserId(wb: Whiteboard, id: String): List[AnnotationVO] = {
    wb.annotationsMap.get(id).getOrElse(List[AnnotationVO]())
  }

  def addAnnotation(wbId: String, userId: String, annotation: AnnotationVO): AnnotationVO = {
    val wb = getWhiteboard(wbId)
    val usersAnnotations = getAnnotationsByUserId(wb, userId)
    val rtnAnnotation = cleansePointsInAnnotation(annotation).copy(position = wb.annotationCount)
    val newAnnotationsMap = wb.annotationsMap + (userId -> (rtnAnnotation :: usersAnnotations))

    val newWb = wb.copy(annotationCount = wb.annotationCount + 1, annotationsMap = newAnnotationsMap)
    //println("Adding annotation to page [" + wb.id + "]. After numAnnotations=[" + getAnnotationsByUserId(wb, userId).length + "].")
    saveWhiteboard(newWb)

    rtnAnnotation
  }

  def updateAnnotation(wbId: String, userId: String, annotation: AnnotationVO): AnnotationVO = {
    val wb = getWhiteboard(wbId)
    val usersAnnotations = getAnnotationsByUserId(wb, userId)

    //not empty and head id equals annotation id
    if (!usersAnnotations.isEmpty && usersAnnotations.head.id == annotation.id) {
      // never comes here since 2.3, but now we use this again for the synchronized update
      val rtnAnnotation = annotation.copy(position = usersAnnotations.head.position)
      val newAnnotationsMap = wb.annotationsMap + (userId -> (rtnAnnotation :: usersAnnotations.tail))
      //println("Annotation has position [" + usersAnnotations.head.position + "]")
      val newWb = wb.copy(annotationsMap = newAnnotationsMap)
      //println("Updating annotation on page [" + wb.id + "]. After numAnnotations=[" + getAnnotationsByUserId(wb, userId).length + "].")
      saveWhiteboard(newWb)
      rtnAnnotation
    } else {
      addAnnotation(wbId, userId, annotation)
    }
  }

  def updateAnnotationPencil(wbId: String, userId: String, annotation: AnnotationVO): AnnotationVO = {
    val wb = getWhiteboard(wbId)
    val usersAnnotations = getAnnotationsByUserId(wb, userId)

    //not empty and head id equals annotation id
    if (!usersAnnotations.isEmpty && usersAnnotations.head.id == annotation.id) {
      val oldAnnotation = usersAnnotations.head
      var oldPoints: List[Float] = List[Float]()
      oldAnnotation.annotationInfo.get("points").foreach(a => {
        a match {
          case a2: List[_] => oldPoints = a2.asInstanceOf[List[Float]]
        }
      }) //oldPoints = a.asInstanceOf[ArrayList[Float]])
      var newPoints: List[Float] = List[Float]()
      annotation.annotationInfo.get("points").foreach(a => {
        a match {
          case a2: List[_] => newPoints = convertListNumbersToFloat(a2)
        }
      }) //newPoints = a.asInstanceOf[ArrayList[Float]])
      val updatedAnnotationData = annotation.annotationInfo + ("points" -> (oldPoints ::: newPoints))
      
      val newPosition = wb.annotationCount
      val updatedAnnotation = annotation.copy(position = newPosition, annotationInfo = updatedAnnotationData)
      
      val newAnnotationsMap = wb.annotationsMap + (userId -> (updatedAnnotation :: usersAnnotations.tail))
      //println("Annotation has position [" + usersAnnotations.head.position + "]")
      val newWb = wb.copy(annotationsMap = newAnnotationsMap)
      //println("Updating annotation on page [" + wb.id + "]. After numAnnotations=[" + getAnnotationsByUserId(wb, userId).length + "].")
      saveWhiteboard(newWb)

      annotation
    } else {
      addAnnotation(wbId, userId, annotation)
    }
  }

  def endAnnotationPencil(wbId: String, userId: String, annotation: AnnotationVO): AnnotationVO = {
    var rtnAnnotation: AnnotationVO = annotation

    val wb = getWhiteboard(wbId)
    val usersAnnotations = getAnnotationsByUserId(wb, userId)

    //not empty and head id equals annotation id
    //println("!usersAnnotations.isEmpty: " + (!usersAnnotations.isEmpty) + ", usersAnnotations.head.id == annotation.id: " + (usersAnnotations.head.id == annotation.id));

    var dimensions: List[Int] = List[Int]()
    annotation.annotationInfo.get("dimensions").foreach(d => {
      d match {
        case d2: List[_] => dimensions = convertListNumbersToInt(d2)
      }
    })

    //println("dimensions.size(): " + dimensions.size());
    if (dimensions.length == 2) {
      var oldPoints: List[Float] = List[Float]()
      val oldAnnotationOption: Option[AnnotationVO] = usersAnnotations.headOption
      if (!oldAnnotationOption.isEmpty) {
        val oldAnnotation = oldAnnotationOption.get
        if (oldAnnotation.id == annotation.id) {
          oldAnnotation.annotationInfo.get("points").foreach(a => {
            a match {
              case a2: List[_] => oldPoints = a2.asInstanceOf[List[Float]]
            }
          })
        }
      }

      var newPoints: List[Float] = List[Float]()
      annotation.annotationInfo.get("points").foreach(a => {
        a match {
          case a2: List[_] => newPoints = convertListNumbersToFloat(a2)
        }
      }) //newPoints = a.asInstanceOf[ArrayList[Float]])

      //println("oldPoints.size(): " + oldPoints.size)

      //val oldPointsJava: java.util.List[java.lang.Float] = oldPoints.asJava.asInstanceOf[java.util.List[java.lang.Float]]
      //println("****class = " + oldPointsJava.getClass())
      
      var updatedAnnotationData: Map[String, Any] = Map[String, Any]()
      if (!SYNCUPDATE || (SYNCUPDATE && SIMPLEPEN)) {
        val pathData = BezierWrapper.lineSimplifyAndCurve((oldPoints ::: newPoints).asJava.asInstanceOf[java.util.List[java.lang.Float]], dimensions(0), dimensions(1))
        //println("Path data: pointssize " + pathData.points.size() + " commandssize " + pathData.commands.size())
        updatedAnnotationData = annotation.annotationInfo + ("points" -> pathData.points.asScala.toList) + ("commands" -> pathData.commands.asScala.toList)
        //println("oldAnnotation value = " + oldAnnotationOption.getOrElse("Empty"))
      } else {
        updatedAnnotationData = annotation.annotationInfo + ("points" -> (oldPoints ::: newPoints))
      }

      var newPosition: Int = oldAnnotationOption match {
        case Some(annotation) => annotation.position
        case None             => wb.annotationCount
      }
      if (SYNCUPDATE) {
        newPosition = wb.annotationCount
      }

      val updatedAnnotation = annotation.copy(position = newPosition, annotationInfo = updatedAnnotationData)

      val updateExists = !usersAnnotations.isEmpty && usersAnnotations.head.id == annotation.id
      var newUsersAnnotations: List[AnnotationVO] = oldAnnotationOption match {
        //As part of the whiteboard improvments for the HTML5 client it no longer sends
        //DRAW_START and DRAW_UPDATE events (#9019). Client now sends drawEndOnly in the
        //SendWhiteboardAnnotationPubMsg so akka knows not to expect usersAnnotations to be accumulating.
        //With #14012, DRAW_UPDATE can happen when the synchronised update option is turned on,
        // and we don't need the argument drawEndOnly parameter anymore.
         case Some(annotation) if (updateExists) => usersAnnotations.tail
         case _                                  => usersAnnotations
      }

      val newAnnotationsMap = wb.annotationsMap + (userId -> (updatedAnnotation :: newUsersAnnotations))
      //println("Annotation has position [" + usersAnnotations.head.position + "]")
      var newWb = wb.copy(annotationsMap = newAnnotationsMap)
      if (SYNCUPDATE) {
        newWb = wb.copy(annotationCount = wb.annotationCount + 1, annotationsMap = newAnnotationsMap)
      }
      //println("Updating annotation on page [" + wb.id + "]. After numAnnotations=[" + getAnnotationsByUserId(wb, userId).length + "].")
      saveWhiteboard(newWb)

      rtnAnnotation = updatedAnnotation
    }

    rtnAnnotation
  }

  def getHistory(wbId: String): Array[AnnotationVO] = {
    val wb = getWhiteboard(wbId)
    wb.annotationsMap.values.flatten.toArray.sortBy(_.position);
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
          val newWb = wb.copy(annotationsMap = new HashMap[String, List[AnnotationVO]]())
          saveWhiteboard(newWb)
          cleared = Some(true)
        }
      }
    }
    cleared
  }

  def undoWhiteboard(wbId: String, userId: String): Option[AnnotationVO] = {
    var last: Option[AnnotationVO] = None
    val wb = getWhiteboard(wbId)

    if (wb.multiUser.contains(userId)) {
      val usersAnnotations = getAnnotationsByUserId(wb, userId)

      //not empty and head id equals annotation id
      if (!usersAnnotations.isEmpty) {
        last = Some(usersAnnotations.head)

        val newWb = removeHeadAnnotation(wb, userId, usersAnnotations)
        //println("Removing annotation on page [" + wb.id + "]. After numAnnotations=[" + getAnnotationsByUserId(wb, userId).length + "].")
        saveWhiteboard(newWb)
      }
    } else {
      if (wb.annotationsMap.nonEmpty) {
        val lastElement = wb.annotationsMap.maxBy(_._2.head.position)
        val lastList = lastElement._2
        last = Some(lastList.head)
        val newWb = removeHeadAnnotation(wb, lastElement._1, lastList)
        //println("Removing annotation on page [" + wb.id + "]. After numAnnotations=[" + getAnnotationsByUserId(wb, userId).length + "].")
        saveWhiteboard(newWb)
      }
    }
    last
  }

  private def removeHeadAnnotation(wb: Whiteboard, key: String, list: List[AnnotationVO]): Whiteboard = {
    val newAnnotationsMap = if (list.tail == Nil) wb.annotationsMap - key else wb.annotationsMap + (key -> list.tail)
    wb.copy(annotationsMap = newAnnotationsMap)
  }

  def modifyWhiteboardAccess(wbId: String, multiUser: Array[String]) {
    val wb = getWhiteboard(wbId)
    val newWb = wb.copy(multiUser = multiUser, oldMultiUser = wb.multiUser, changedModeOn = System.currentTimeMillis())
    saveWhiteboard(newWb)
  }

  def modifyWBMode(mId: String, wbMode: Map[String, Boolean]) {
    if (wbMode.isDefinedAt("synchronizeWBUpdate")) {
      SYNCUPDATE = wbMode.get("synchronizeWBUpdate").get
    }
    if (wbMode.isDefinedAt("simplifyPencil")) {
      SIMPLEPEN = wbMode.get("simplifyPencil").get
    }
  }
  
  def getWhiteboardAccess(wbId: String): Array[String] = getWhiteboard(wbId).multiUser

  def hasWhiteboardAccess(wbId: String, userId: String): Boolean = {
    val wb = getWhiteboard(wbId)
    wb.multiUser.contains(userId) || {
      val lastChange = System.currentTimeMillis() - wb.changedModeOn
      wb.oldMultiUser.contains(userId) && lastChange < 5000
    }
  }

  def getChangedModeOn(wbId: String): Long = getWhiteboard(wbId).changedModeOn

  def cleansePointsInAnnotation(ann: AnnotationVO): AnnotationVO = {
    var updatedAnnotationInfo = ann.annotationInfo
    ann.annotationInfo.get("points").foreach(points =>
      updatedAnnotationInfo = (ann.annotationInfo + ("points" -> convertListNumbersToFloat(points.asInstanceOf[List[_]]))))
    ann.copy(annotationInfo = updatedAnnotationInfo)
  }

  private def convertListNumbersToFloat(list: List[_]): List[Float] = {
    list.map {
      case f: Double => f.toFloat
      case f: Float  => f
      case f: Int    => f.toFloat
    }.asInstanceOf[List[Float]]
  }

  private def convertListNumbersToInt(list: List[_]): List[Int] = {
    list.map {
      case f: Double => f.toInt
      case f: Float  => f.toInt
      case f: Int    => f
    }.asInstanceOf[List[Int]]
  }
}
