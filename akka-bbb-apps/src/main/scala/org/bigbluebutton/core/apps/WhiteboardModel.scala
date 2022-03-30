package org.bigbluebutton.core.apps

//import java.util.ArrayList;
import org.bigbluebutton.core.util.jhotdraw.BezierWrapper
import scala.collection.immutable.List
import scala.collection.immutable.HashMap
import scala.collection.JavaConverters._
import org.bigbluebutton.common2.msgs.{ AnnotationEvent, AnnotationVO, ModificationVO }
import org.bigbluebutton.core.apps.whiteboard.Whiteboard
import org.bigbluebutton.SystemConfiguration

class WhiteboardModel extends SystemConfiguration {
  private var _whiteboards = new HashMap[String, Whiteboard]()

  private def saveWhiteboard(wb: Whiteboard) = {
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
      new HashMap[String, List[AnnotationEvent]]()
    )
  }

  private def getAnnotationsByUserId(wb: Whiteboard, id: String): List[AnnotationEvent] = {
    wb.annotationsMap.get(id).getOrElse(List[AnnotationEvent]())
  }

  def addAnnotation(wbId: String, annotation: AnnotationVO): AnnotationVO = {
    val wb = getWhiteboard(wbId)
    val userId = annotation.userId
    val usersAnnotations = getAnnotationsByUserId(wb, userId)
    val rtnAnnotation = cleansePointsInAnnotation(annotation).copy(position = wb.annotationCount)
    val newAnnotationsMap = wb.annotationsMap + (userId -> (rtnAnnotation :: usersAnnotations))

    val newWb = wb.copy(annotationCount = wb.annotationCount + 1, annotationsMap = newAnnotationsMap)
    //println("Adding annotation to page [" + wb.id + "]. After numAnnotations=[" + getAnnotationsByUserId(wb, userId).length + "].")
    saveWhiteboard(newWb)

    rtnAnnotation
  }

  /**
   * @param annotationToRemove annotation that should be deleted
   * @return removed annotations with zipped Index
   */
  def removeAnnotations(annotationIds: List[String], wbID: String): List[Tuple2[AnnotationVO, Int]] = {
    //TODO Update positions
    val wb = getWhiteboard(wbID)
    val removedAnnotationsWithPos = wb.annotationsMap.values.map { case list => list.zipWithIndex }.flatten.filter {
      case (annotation: AnnotationVO, _)     => annotationIds.contains(annotation.id)
      case (modification: ModificationVO, _) => false
    }.asInstanceOf[Iterable[(AnnotationVO, Int)]]

    val newAnnotationsMap = wb.annotationsMap.mapValues {
      case list => list.filterNot {
        case annotation: AnnotationVO     => annotationIds.contains(annotation.id)
        case modification: ModificationVO => false
      }
    }.filter { case (userId, list) => list.nonEmpty }

    val newWhiteboard = wb.copy(annotationsMap = newAnnotationsMap)
    saveWhiteboard(newWhiteboard)

    removedAnnotationsWithPos.toList
  }

  def addModifyAnnotation(modification: ModificationVO) = {
    val wb = getWhiteboard(modification.wbId)
    val userId = modification.userId

    val newAnnotationsMap = wb.annotationsMap + (userId -> (modification.copy(position = wb.annotationCount) :: getAnnotationsByUserId(wb, userId)))
    val newWb = wb.copy(annotationCount = wb.annotationCount + 1, annotationsMap = newAnnotationsMap)
    saveWhiteboard(newWb)
  }

  def updateAnnotation(wbId: String, annotation: AnnotationVO): AnnotationVO = {
    val wb = getWhiteboard(wbId)
    val userId = annotation.userId
    val usersAnnotations = getAnnotationsByUserId(wb, userId)

    //not empty and head id equals annotation id
    if (usersAnnotations.nonEmpty && usersAnnotations.head.isInstanceOf[AnnotationVO] && usersAnnotations.head.asInstanceOf[AnnotationVO].id == annotation.id) {
      val rtnAnnotation = annotation.copy(position = usersAnnotations.head.asInstanceOf[AnnotationVO].position)
      val newAnnotationsMap = wb.annotationsMap + (userId -> (rtnAnnotation :: usersAnnotations.tail))
      //println("Annotation has position [" + usersAnnotations.head.position + "]")
      val newWb = wb.copy(annotationsMap = newAnnotationsMap)
      //println("Updating annotation on page [" + wb.id + "]. After numAnnotations=[" + getAnnotationsByUserId(wb, userId).length + "].")
      saveWhiteboard(newWb)
      rtnAnnotation
    } else {
      addAnnotation(wbId, annotation)
    }
  }

  def updateAnnotationPencil(wbId: String, annotation: AnnotationVO): AnnotationVO = {
    val wb = getWhiteboard(wbId)
    val userId = annotation.userId
    val usersAnnotations = getAnnotationsByUserId(wb, userId)

    //not empty and head id equals annotation id
    if (!usersAnnotations.isEmpty && usersAnnotations.head.isInstanceOf[AnnotationVO] && usersAnnotations.head.asInstanceOf[AnnotationVO].id == annotation.id) {
      val oldAnnotation = usersAnnotations.head.asInstanceOf[AnnotationVO]
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
      val updatedAnnotation = annotation.copy(position = oldAnnotation.position, annotationInfo = updatedAnnotationData)

      val newAnnotationsMap = wb.annotationsMap + (userId -> (updatedAnnotation :: usersAnnotations.tail))
      //println("Annotation has position [" + usersAnnotations.head.position + "]")
      val newWb = wb.copy(annotationsMap = newAnnotationsMap)
      //println("Updating annotation on page [" + wb.id + "]. After numAnnotations=[" + getAnnotationsByUserId(wb, userId).length + "].")
      saveWhiteboard(newWb)

      annotation
    } else {
      addAnnotation(wbId, annotation)
    }
  }

  def endAnnotationPencil(wbId: String, annotation: AnnotationVO, drawEndOnly: Boolean): AnnotationVO = {
    var rtnAnnotation: AnnotationVO = annotation

    val wb = getWhiteboard(wbId)
    val userId = annotation.userId
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
      val oldAnnotationOption: Option[AnnotationVO] = usersAnnotations.headOption match {
        case Some(a: AnnotationVO) => Some(a)
        case _                     => None
      }
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
      val pathData = BezierWrapper.lineSimplifyAndCurve((oldPoints ::: newPoints).asJava.asInstanceOf[java.util.List[java.lang.Float]], dimensions(0), dimensions(1))
      //println("Path data: pointssize " + pathData.points.size() + " commandssize " + pathData.commands.size())

      val updatedAnnotationData = annotation.annotationInfo + ("points" -> pathData.points.asScala.toList) + ("commands" -> pathData.commands.asScala.toList)
      //println("oldAnnotation value = " + oldAnnotationOption.getOrElse("Empty"))

      var newPosition: Int = wb.annotationCount

      val updatedAnnotation = annotation.copy(position = newPosition, annotationInfo = updatedAnnotationData)

      var newUsersAnnotations: List[AnnotationEvent] = oldAnnotationOption match {
        //As part of the whiteboard improvments for the HTML5 client it no longer sends
        //DRAW_START and DRAW_UPDATE events (#9019). Client now sends drawEndOnly in the
        //SendWhiteboardAnnotationPubMsg so akka knows not to expect usersAnnotations to be accumulating.
        case Some(annotation) if (drawEndOnly == true) => usersAnnotations
        case Some(annotation)                          => usersAnnotations.tail
        case None                                      => usersAnnotations
      }

      val newAnnotationsMap = wb.annotationsMap + (userId -> (updatedAnnotation :: newUsersAnnotations))
      //println("Annotation has position [" + usersAnnotations.head.position + "]")
      val newWb = wb.copy(annotationCount = wb.annotationCount + 1, annotationsMap = newAnnotationsMap)
      //println("Updating annotation on page [" + wb.id + "]. After numAnnotations=[" + getAnnotationsByUserId(wb, userId).length + "].")
      saveWhiteboard(newWb)

      rtnAnnotation = updatedAnnotation
    }

    rtnAnnotation
  }

  def getHistory(wbId: String): Array[AnnotationVO] = {
    val wb = getWhiteboard(wbId)
    //TODO Update for working Undo in recording
    wb.annotationsMap.values.flatten.filter {
      case a: AnnotationVO => true
      case _               => false
    }.asInstanceOf[List[AnnotationVO]].toArray.sortBy(_.position);
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
          val newWb = wb.copy(annotationsMap = new HashMap[String, List[AnnotationEvent]]())
          saveWhiteboard(newWb)
          cleared = Some(true)
        }
      }
    }
    cleared
  }

  def undoWhiteboard(wbId: String, userId: String): Option[AnnotationEvent] = {
    var last: Option[AnnotationEvent] = None
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
    last match {
      case Some(modification: ModificationVO) => {
        val newWb = revokeModification(modification)
        saveWhiteboard(newWb)
      }
      case _ =>
    }
    last
  }

  private def removeHeadAnnotation(wb: Whiteboard, key: String, list: List[AnnotationEvent]): Whiteboard = {
    val newAnnotationsMap = if (list.tail == Nil) wb.annotationsMap - key else wb.annotationsMap + (key -> list.tail)
    wb.copy(annotationsMap = newAnnotationsMap)
  }

  private def revokeModification(modification: ModificationVO): Whiteboard = {
    var newAnnotationList: List[AnnotationEvent] = List()
    val wb = getWhiteboard(modification.wbId)
    val addedAnnotationIds = modification.addedAnnotations.map { case ann: AnnotationVO => ann.id }
    val usersAnnotationsWithoutAdded = getAnnotationsByUserId(wb, modification.userId).filter {
      case mod: ModificationVO => true
      case ann: AnnotationVO => {
        if (addedAnnotationIds.contains(ann.id)) {
          false
        }
        true
      }
    }

    def insert[T](list: List[T], i: Int, value: T) = {
      val (front, back) = list.splitAt(i)
      front ++ List(value) ++ back
    }

    newAnnotationList = usersAnnotationsWithoutAdded

    if (modification.removedAnnotations.nonEmpty) {
      for ((ann, index) <- modification.removedAnnotations) {
        newAnnotationList = insert(newAnnotationList, index, ann)
      }
    }

    val newAnnotationsMap = if (newAnnotationList.isEmpty) wb.annotationsMap - modification.userId else wb.annotationsMap + (modification.userId -> newAnnotationList)
    wb.copy(annotationsMap = newAnnotationsMap)
  }

  def modifyWhiteboardAccess(wbId: String, multiUser: Array[String]) = {
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
