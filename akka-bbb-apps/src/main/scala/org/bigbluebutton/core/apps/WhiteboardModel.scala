package org.bigbluebutton.core.apps

//import java.util.ArrayList;
import org.bigbluebutton.core.util.jhotdraw.BezierWrapper
import org.bigbluebutton.core.util.{ BoundingBox, ShapeType, ClippingPolygon }
import scala.collection.immutable.{ List, HashMap }
import scala.Tuple2
import scala.collection.mutable.{ ListBuffer, Set }
import scala.collection.JavaConverters._
import org.bigbluebutton.common2.msgs.{ AnnotationEvent, AnnotationVO, ModificationVO }
import org.bigbluebutton.core.apps.whiteboard.Whiteboard
import org.bigbluebutton.core.apps.WhiteboardKeyUtil
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

  def addAnnotation(wbId: String, annotation: AnnotationVO, position: Int = -1): AnnotationVO = {
    val wb = getWhiteboard(wbId)
    val userId = annotation.userId
    val usersAnnotations = getAnnotationsByUserId(wb, userId)
    val rtnAnnotation = cleansePointsInAnnotation(annotation).copy(position = wb.annotationCount)

    if (position == -1) {
      val newAnnotationsMap = wb.annotationsMap + (userId -> (rtnAnnotation :: usersAnnotations))
      val newWb = wb.copy(annotationCount = wb.annotationCount + 1, annotationsMap = newAnnotationsMap)
      //println("Adding annotation to page [" + wb.id + "]. After numAnnotations=[" + getAnnotationsByUserId(wb, userId).length + "].")
      saveWhiteboard(newWb)
    } else {
      val newAnnotationsMap = wb.annotationsMap + (userId -> (insert(usersAnnotations, position, annotation)))
      val newWb = wb.copy(annotationCount = wb.annotationCount + 1, annotationsMap = newAnnotationsMap)
      //println("Adding annotation to page [" + wb.id + "]. After numAnnotations=[" + getAnnotationsByUserId(wb, userId).length + "].")
      saveWhiteboard(newWb)
    }

    rtnAnnotation
  }

  /**
   * @param annotationToRemove annotation that should be deleted
   * @return removed annotations zipped with their position
   */
  def removeAnnotations(annotationIds: List[String], wbID: String, userId: String): List[Tuple2[AnnotationVO, Int]] = {
    //TODO Update positions
    var removedIds: Set[String] = Set()
    val wb = getWhiteboard(wbID)
    // Extract UserId from annotationId
    val groupedIdsToRemove = annotationIds.sorted.groupBy(s => s.substring(0, s.indexOf("-")))
    for ((extractedUserId, idsToRemove) <- groupedIdsToRemove) {
      if (wb.annotationsMap.contains(extractedUserId)) {
        var usersAnnotations = getAnnotationsByUserId(wb, userId)
        removedIds ++= annotationIds.filter(annotationToRemove =>
          usersAnnotations.exists {
            case userAnnotation: AnnotationVO => userAnnotation.id.equals(annotationToRemove)
            case _                            => false
          })
      }
    }
    val removedAnnotationsWithPos = wb.annotationsMap.values.map { case list => list.zipWithIndex }.flatten.filter {
      case (annotation: AnnotationVO, _)     => removedIds.contains(annotation.id)
      case (modification: ModificationVO, _) => false
    }.asInstanceOf[Iterable[(AnnotationVO, Int)]]

    val newAnnotationsMap = wb.annotationsMap.mapValues {
      case list => list.filterNot {
        case annotation: AnnotationVO     => removedIds.contains(annotation.id)
        case modification: ModificationVO => false
      }
    }.filter { case (userId, list) => list.nonEmpty }

    val newWhiteboard = wb.copy(annotationsMap = newAnnotationsMap)
    saveWhiteboard(newWhiteboard)

    removedAnnotationsWithPos.toList
  }

  def addModificationVO(modification: ModificationVO) = {
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

      var newPosition: Int = oldAnnotationOption match {
        case Some(annotation) => annotation.position
        case None             => wb.annotationCount
      }

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
      val newWb = wb.copy(annotationsMap = newAnnotationsMap)
      //println("Updating annotation on page [" + wb.id + "]. After numAnnotations=[" + getAnnotationsByUserId(wb, userId).length + "].")
      saveWhiteboard(newWb)

      rtnAnnotation = updatedAnnotation
    }

    rtnAnnotation
  }

  def evaluateAnnotationEraser(wbId: String, userId: String, annotation: AnnotationVO): Option[ModificationVO] = {
    var rtnModification: Option[ModificationVO] = None

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
      var eraserPoints: List[Float] = List[Float]()
      annotation.annotationInfo.get("points").foreach(a => {
        a match {
          case a2: List[_] => eraserPoints = convertListNumbersToFloat(a2)
        }
      }) //newPoints = a.asInstanceOf[ArrayList[Float]])

      val pathData = BezierWrapper.lineSimplifyAndCurve(eraserPoints.asJava.asInstanceOf[java.util.List[java.lang.Float]], dimensions(0), dimensions(1))
      eraserPoints = pathData.points.asScala.toList.asInstanceOf[List[scala.Float]]

      def extractThickness(a: AnnotationVO): Float = {
        a.annotationInfo.get("thickness") match {
          case Some(thickness: Float)  => thickness
          case Some(thickness: Double) => thickness.toFloat
          case _                       => 0
        }
      }

      var intersectingAnnotations: scala.collection.mutable.Map[String, ListBuffer[AnnotationVO]] = scala.collection.mutable.Map[String, ListBuffer[AnnotationVO]]()
      var clippedAnnotations: ListBuffer[AnnotationVO] = ListBuffer.empty

      val eraserThickness = extractThickness(annotation)
      val eraserBoundingBox: BoundingBox = new BoundingBox(eraserPoints, eraserThickness, ShapeType.Line)
      val eraserPolygon: ClippingPolygon = new ClippingPolygon(eraserPoints, eraserThickness)
      println("deb new Eraser\n\n")
      wb.annotationsMap.foreach {
        case (userId, annotations) => {
          var indexCount = 1
          annotations.foreach {
            case a: AnnotationVO => {
              //Searching for intersecting annotations
              a.annotationInfo.get("type") match {
                case Some(WhiteboardKeyUtil.PENCIL_TYPE) => {
                  a.annotationInfo.get("points") match {
                    case Some(points: List[Float]) => {
                      a.annotationInfo.get("commands") match {
                        case Some(commands: List[Int]) => {
                          val thickness = extractThickness(a)
                          val annotationBB = new BoundingBox(points, thickness, ShapeType.Line)
                          if (eraserBoundingBox.intersects(annotationBB)) {
                            val newPointsOption = eraserPolygon.clipPoints(points, thickness)
                            if (newPointsOption.nonEmpty) {
                              if (newPointsOption.get.nonEmpty) {
                                val newAnnotations = splitAnnotation(a, newPointsOption.get)
                                val originalIndex = annotations.indexOf(a)
                                for (newAnn <- newAnnotations) {
                                  addAnnotation(newAnn.wbId, newAnn, originalIndex + indexCount)
                                  indexCount += 1
                                }
                                clippedAnnotations ++= newAnnotations
                              }
                              intersectingAnnotations.get(userId) match {
                                case Some(listbuffer: ListBuffer[AnnotationVO]) => listbuffer += a
                                case None                                       => intersectingAnnotations += (userId -> ListBuffer[AnnotationVO](a))
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
                case _ => {}
              }
            }
            case _ => {}
          }
        }
      }

      var modification: ModificationVO = ModificationVO(
        removedAnnotations = intersectingAnnotations.foldLeft(ListBuffer.empty[Tuple2[AnnotationVO, Int]]) {
          case (acc: ListBuffer[(AnnotationVO, Int)], (uId: String, anns: ListBuffer[AnnotationVO])) => acc ++ removeAnnotations(anns.map(a => a.id).toList, wbID = wb.id, userId = uId)
        }.toList,
        addedAnnotations = clippedAnnotations.toList,
        wbId = wb.id, userId = userId, position = 0
      )

      addModificationVO(modification)
      rtnModification = Some(modification.copy(removedAnnotations = (annotation, 0) :: modification.removedAnnotations))
      //println("deb rtnModification: " + rtnModification)
    }

    rtnModification
  }

  private def splitAnnotation(ann: AnnotationVO, newPoints: List[List[Float]]): List[AnnotationVO] = {
    val newId: String = ann.id.substring(0, ann.id.lastIndexOf("-")) + "-" + System.currentTimeMillis
    var dimensions: List[Int] = List[Int](0, 0)
    ann.annotationInfo.get("dimensions").foreach(d => {
      d match {
        case d2: List[_] => dimensions = convertListNumbersToInt(d2)
      }
    })
    var count = 0
    newPoints.map {
      case points: List[Float] => {
        val customId = newId + ":" + count
        count += 1
        val pathData = BezierWrapper.lineSimplifyAndCurve(points.asJava.asInstanceOf[java.util.List[java.lang.Float]], dimensions(0), dimensions(1))
        ann.copy(
          id = customId,
          annotationInfo = ann.annotationInfo + (("points") -> pathData.points.asScala.toList) + ("commands" -> pathData.commands.asScala.toList) + ("id" -> customId)
        )
      }
    }
  }

  def getHistory(wbId: String): Array[AnnotationVO] = {
    val wb = getWhiteboard(wbId)
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
      case _ => {}
    }
    last
  }

  private def removeHeadAnnotation(wb: Whiteboard, key: String, list: List[AnnotationEvent]): Whiteboard = {
    val newAnnotationsMap = if (list.tail == Nil) wb.annotationsMap - key else wb.annotationsMap + (key -> list.tail)
    wb.copy(annotationsMap = newAnnotationsMap)
  }

  private def insert[T](list: List[T], i: Int, value: T) = {
    val (front, back) = list.splitAt(i)
    front ++ List(value) ++ back
  }

  private def revokeModification(modification: ModificationVO): Whiteboard = {
    var newAnnotationList: List[AnnotationEvent] = List()
    val wb = getWhiteboard(modification.wbId)
    val addedAnnotationsGrouped = modification.addedAnnotations.groupBy(_.userId)

    var newAnnotationsMap = wb.annotationsMap.map {
      case (uId: String, anns: List[AnnotationEvent]) => {
        val annsToRemoveOption = addedAnnotationsGrouped.get(uId)
        if (annsToRemoveOption.isDefined) {
          (uId, anns.diff(annsToRemoveOption.get))
        } else {
          (uId, anns)
        }
      }
    }
    val newWb = wb.copy(annotationsMap = newAnnotationsMap)
    var currentUserId: Option[String] = None

    if (modification.removedAnnotations.nonEmpty) {
      for ((ann, index) <- modification.removedAnnotations) {
        if (currentUserId.isEmpty) {
          currentUserId = Some(ann.userId)
          newAnnotationList = getAnnotationsByUserId(newWb, currentUserId.get)
        }
        if (ann.userId != currentUserId.get) {
          newAnnotationsMap = if (newAnnotationList.isEmpty) newAnnotationsMap - currentUserId.get else newAnnotationsMap + (currentUserId.get -> newAnnotationList)
          currentUserId = Some(ann.userId)
          newAnnotationList = getAnnotationsByUserId(newWb, currentUserId.get)
        }
        newAnnotationList = insert(newAnnotationList, index, ann)
      }
    }
    if (currentUserId.isDefined) {
      newAnnotationsMap = if (newAnnotationList.isEmpty) newAnnotationsMap - currentUserId.get else newAnnotationsMap + (currentUserId.get -> newAnnotationList)
    }
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