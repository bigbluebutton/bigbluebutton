package org.bigbluebutton.core.apps

import java.util.ArrayList;

import org.bigbluebutton.core.util.jhotdraw.BezierWrapper

import scala.collection.immutable.List
import scala.collection.immutable.HashMap

case class AnnotationVO(id: String, status: String, shapeType: String, shape: scala.collection.immutable.Map[String, Object], wbId: String, userId: String, position: Int)

class WhiteboardModel {
  private var _whiteboards = new HashMap[String, Whiteboard]()

  private var _multiUser = false

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
    new Whiteboard(wbId, 0, new HashMap[String, List[AnnotationVO]]())
  }

  private def getShapesByUserId(wb: Whiteboard, id: String): List[AnnotationVO] = {
    wb.shapesMap.get(id).getOrElse(List[AnnotationVO]())
  }

  def addAnnotation(wbId: String, userId: String, shape: AnnotationVO) {
    val wb = getWhiteboard(wbId)
    val usersShapes = getShapesByUserId(wb, userId)
    val newShapesMap = wb.shapesMap + (userId -> (shape.copy(position = wb.shapeCount) :: usersShapes))

    val newWb = new Whiteboard(wb.id, wb.shapeCount + 1, newShapesMap)
    //println("Adding shape to page [" + wb.id + "]. After numShapes=[" + getShapesByUserId(wb, userId).length + "].")
    saveWhiteboard(newWb)
  }

  def updateAnnotation(wbId: String, userId: String, shape: AnnotationVO) {
    val wb = getWhiteboard(wbId)
    val usersShapes = getShapesByUserId(wb, userId)

    //not empty and head id equals shape id
    if (!usersShapes.isEmpty && usersShapes.head.id == shape.id) {
      val newShapesMap = wb.shapesMap + (userId -> (shape.copy(position = usersShapes.head.position) :: usersShapes.tail))
      //println("Shape has position [" + usersShapes.head.position + "]")
      val newWb = wb.copy(shapesMap = newShapesMap)
      //println("Updating shape on page [" + wb.id + "]. After numShapes=[" + getShapesByUserId(wb, userId).length + "].")
      saveWhiteboard(newWb)
    } else {
      addAnnotation(wbId, userId, shape)
    }
  }

  def updateAnnotationPencil(wbId: String, userId: String, shape: AnnotationVO) {
    val wb = getWhiteboard(wbId)
    val usersShapes = getShapesByUserId(wb, userId)

    //not empty and head id equals shape id
    if (!usersShapes.isEmpty && usersShapes.head.id == shape.id) {
      val oldShape = usersShapes.head
      var oldPoints: ArrayList[Float] = new ArrayList[Float]()
      oldShape.shape.get("points").foreach(a => {
        a match {
          case a2: ArrayList[Any] => oldPoints = a2.asInstanceOf[ArrayList[Float]]
        }
      }) //oldPoints = a.asInstanceOf[ArrayList[Float]])
      var newPoints: ArrayList[Float] = new ArrayList[Float]()
      shape.shape.get("points").foreach(a => {
        a match {
          case a2: ArrayList[Any] => newPoints = a2.asInstanceOf[ArrayList[Float]]
        }
      }) //newPoints = a.asInstanceOf[ArrayList[Float]])
      oldPoints.addAll(newPoints)
      val updatedShapeData = shape.shape + ("points" -> oldPoints.asInstanceOf[Object])
      val updatedShape = shape.copy(position = oldShape.position, shape = updatedShapeData)

      val newShapesMap = wb.shapesMap + (userId -> (updatedShape :: usersShapes.tail))
      //println("Shape has position [" + usersShapes.head.position + "]")
      val newWb = wb.copy(shapesMap = newShapesMap)
      //println("Updating shape on page [" + wb.id + "]. After numShapes=[" + getShapesByUserId(wb, userId).length + "].")
      saveWhiteboard(newWb)
    } else {
      addAnnotation(wbId, userId, shape)
    }
  }

  def endAnnotationPencil(wbId: String, userId: String, shape: AnnotationVO): AnnotationVO = {
    var rtnAnnotation: AnnotationVO = shape

    val wb = getWhiteboard(wbId)
    val usersShapes = getShapesByUserId(wb, userId)

    //not empty and head id equals shape id
    //println("!usersShapes.isEmpty: " + (!usersShapes.isEmpty) + ", usersShapes.head.id == shape.id: " + (usersShapes.head.id == shape.id));
    if (!usersShapes.isEmpty && usersShapes.head.id == shape.id) {
      var dimensions: ArrayList[java.lang.Float] = new ArrayList[java.lang.Float]()
      shape.shape.get("points").foreach(d => {
        d match {
          case d2: ArrayList[Any] => dimensions = d2.asInstanceOf[ArrayList[java.lang.Float]]
        }
      })

      //println("dimensions.size(): " + dimensions.size());
      if (dimensions.size() == 2) {
        val oldShape = usersShapes.head
        var oldPoints: ArrayList[java.lang.Float] = new ArrayList[java.lang.Float]()
        oldShape.shape.get("points").foreach(a => {
          a match {
            case a2: ArrayList[Any] => oldPoints = a2.asInstanceOf[ArrayList[java.lang.Float]]
          }
        })

        //println("oldPoints.size(): " + oldPoints.size());

        val pathData = BezierWrapper.lineSimplifyAndCurve(oldPoints, dimensions.get(0).toInt, dimensions.get(1).toInt)
        //println("Path data: pointssize " + pathData.points.size() + " commandssize " + pathData.commands.size())

        val updatedShapeData = shape.shape + ("points" -> pathData.points.asInstanceOf[Object]) + ("commands" -> pathData.commands.asInstanceOf[Object])
        val updatedShape = shape.copy(position = oldShape.position, shape = updatedShapeData)

        val newShapesMap = wb.shapesMap + (userId -> (updatedShape :: usersShapes.tail))
        //println("Shape has position [" + usersShapes.head.position + "]")
        val newWb = wb.copy(shapesMap = newShapesMap)
        //println("Updating shape on page [" + wb.id + "]. After numShapes=[" + getShapesByUserId(wb, userId).length + "].")
        saveWhiteboard(newWb)

        rtnAnnotation = updatedShape
      }
    }

    rtnAnnotation
  }

  def getHistory(wbId: String): Array[AnnotationVO] = {
    val wb = getWhiteboard(wbId)
    wb.shapesMap.values.flatten.toArray.sortBy(_.position);
  }

  def clearWhiteboard(wbId: String, userId: String): Option[Boolean] = {
    var cleared: Option[Boolean] = None

    if (hasWhiteboard(wbId)) {
      val wb = getWhiteboard(wbId)

      if (_multiUser) {
        if (wb.shapesMap.contains(userId)) {
          val newWb = wb.copy(shapesMap = wb.shapesMap - userId)
          saveWhiteboard(newWb)
          cleared = Some(false)
        }
      } else {
        if (wb.shapesMap.nonEmpty) {
          val newWb = wb.copy(shapesMap = new HashMap[String, List[AnnotationVO]]())
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

    if (_multiUser) {
      val usersShapes = getShapesByUserId(wb, userId)

      //not empty and head id equals shape id
      if (!usersShapes.isEmpty) {
        last = Some(usersShapes.head)

        val newWb = removeHeadShape(wb, userId, usersShapes)
        //println("Removing shape on page [" + wb.id + "]. After numShapes=[" + getShapesByUserId(wb, userId).length + "].")
        saveWhiteboard(newWb)
      }
    } else {
      if (wb.shapesMap.nonEmpty) {
        val lastElement = wb.shapesMap.maxBy(_._2.head.position)
        val lastList = lastElement._2
        last = Some(lastList.head)
        val newWb = removeHeadShape(wb, lastElement._1, lastList)
        //println("Removing shape on page [" + wb.id + "]. After numShapes=[" + getShapesByUserId(wb, userId).length + "].")
        saveWhiteboard(newWb)
      }
    }
    last
  }

  private def removeHeadShape(wb: Whiteboard, key: String, list: List[AnnotationVO]): Whiteboard = {
    val newShapesMap = if (list.tail == Nil) wb.shapesMap - key else wb.shapesMap + (key -> list.tail)
    wb.copy(shapesMap = newShapesMap)
  }

  def modifyWhiteboardAccess(multiUser: Boolean) {
    _multiUser = multiUser
  }

  def getWhiteboardAccess(): Boolean = {
    _multiUser
  }
}