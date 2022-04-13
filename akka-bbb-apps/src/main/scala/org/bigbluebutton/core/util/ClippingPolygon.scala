package org.bigbluebutton.core.util

import scala.collection.mutable.ListBuffer
import scala.util.control.Breaks.{ break, breakable }

class ClippingPolygon {
  private var polygonlist: List[Tuple4[Vec2, Vec2, Vec2, Vec2]] = List.empty
  private var normals: List[Vec2] = List.empty
  private var thickness: Float = 0f

  def this(points: List[Float], thickness: Float) = {
    this()

    //Convert points into list of vertecies with a convex shape
    var lastX: Option[Float] = None
    var lastPoint: Option[Vec2] = None
    var lastVector: Option[Vec2] = None
    val vertexList: ListBuffer[Vec2] = ListBuffer.empty[Vec2]
    val expansionVectorList: ListBuffer[Vec2] = ListBuffer.empty[Vec2]
    for (p <- points) {
      if (lastX.isEmpty) {
        lastX = Some(p)
      } else {
        val currentVec = Vec2(lastX.get, p)
        lastX = None
        if (lastPoint.isEmpty) {
          lastPoint = Some(currentVec)
        } else {
          if (lastVector.isEmpty) {
            val v = currentVec - lastPoint.get
            val n = v.getSurfaceNormal * (0.5f * thickness)
            (-n.norm) +=: expansionVectorList += (n.norm)
            (lastPoint.get - n) +=: vertexList += (lastPoint.get + n)
            lastVector = Some(v)
            lastPoint = Some(currentVec)
          } else {
            val v1 = lastVector.get
            val v2 = currentVec - lastPoint.get
            val n = (v1.getSurfaceNormal + v2.getSurfaceNormal).norm * (0.5f * thickness)
            (-n.norm) +=: expansionVectorList += (n.norm)
            (lastPoint.get - n) +=: vertexList += (lastPoint.get + n)
            lastVector = Some(v2)
            lastPoint = Some(currentVec)
          }
        }
      }
    }
    //Add last Point
    if (lastPoint.isDefined && lastVector.isDefined) {
      val v = lastVector.get
      val n = v.getSurfaceNormal * (0.5f * thickness)
      (-n.norm) +=: expansionVectorList += (n.norm)
      (lastPoint.get - n) +=: vertexList += (lastPoint.get + n)
    }

    polygonlist = (vertexList zip (vertexList.toList.drop(1) ++ vertexList.toList.take(1)) zip expansionVectorList zip (expansionVectorList.drop(1) ++ expansionVectorList.take(1))).map {
      case (((a, b), c), d) => (a, b, c, d)
    }.toList
    normals = polygonlist.map(t => (t._2 - t._1).getSurfaceNormal).toList
    this.thickness = thickness
  }

  def clipPoints(points: List[Float], thickness: Float): Option[List[List[Float]]] = {
    //Using altered Cyrus Beck Algorithm
    println("deb points: " + points)
    //println("deb vertecies: " + polygonlist)
    //println("deb normals: " + normals)
    val returnPoints: ListBuffer[List[Float]] = ListBuffer.empty
    var currentLineSegment: ListBuffer[Float] = ListBuffer.empty
    var changedLine: Boolean = false
    if (points.length > 3) {
      var linepoints = points.take(2)
      var remainingPoints = points.drop(2)
      var p0 = Vec2(linepoints(0), linepoints(1))
      var p1 = p0

      while (remainingPoints.length > 1) {
        breakable {
          linepoints = remainingPoints.take(2)
          remainingPoints = remainingPoints.drop(2)
          p0 = p1
          p1 = Vec2(linepoints(0), linepoints(1))
          //Degenerate Line
          if (p0 == p1) {
            break
          }
          val p0p1 = p1 - p0
          //To detect lines inside the eraser
          val thickp0 = p0 - (p0p1 * (this.thickness + thickness))

          var enteringLeaving = ListBuffer.empty[Tuple2[Float, Boolean]]

          for (((defaultVert1, defaultVert2, expVec1, expVec2), n) <- polygonlist.zip(normals)) {
            //println("deb vert, n, p0, p1: " + (vert, n) + " " + (p0, p1))
            val vert1 = defaultVert1 + (expVec1 * (0.5f * thickness))
            val vert2 = defaultVert2 + (expVec2 * (0.5f * thickness))
            if (intersect(vert1, vert2, thickp0, p1)) {
              val clipLine = p0 - vert1
              val numerator = n.dot(clipLine)
              val denominator = n.dot(p0p1)

              val t = -(numerator / denominator)
              if (denominator > 0) {
                enteringLeaving += ((t, true))
              } else {
                enteringLeaving += ((t, false))
              }
            }
          }

          //Line Segment does not interlap the eraser
          if (enteringLeaving.isEmpty) {
            currentLineSegment += p0.x
            currentLineSegment += p0.y
          } else {
            enteringLeaving = enteringLeaving.sortBy(_._1)
            //filter out multiple entries and multiple exits
            val (newEnteringLeaving, last) = enteringLeaving.foldLeft((ListBuffer.empty[Tuple2[Float, Boolean]], (-1f, !enteringLeaving(0)._2))) {
              case ((buff: ListBuffer[Tuple2[Float, Boolean]], last), elem) => {
                if (elem._2) { //isLeaving
                  (buff, elem)
                } else {
                  if (last._2) { //isLeaving
                    if (last._1 != -1f) { //is not first entry
                      (buff :+ last :+ elem, elem)
                    } else {
                      (buff :+ elem, elem)
                    }
                  } else {
                    (buff, elem)
                  }

                }
              }
            }
            if (last._2) { //isLeaving
              enteringLeaving = newEnteringLeaving :+ last
            } else {
              enteringLeaving = newEnteringLeaving
            }
            println("deb enteringLeaving: " + enteringLeaving)
            var isFirstPoint = true
            for ((t, isLeaving) <- enteringLeaving) {
              if (isLeaving) {
                if (t >= 0f) {
                  changedLine = true
                  val point = p0 + (p0p1 * t) // + (p0p1.norm * (0.5f * thickness))
                  currentLineSegment += point.x
                  currentLineSegment += point.y
                  isFirstPoint = false
                } else { //doesn't actually leave
                  currentLineSegment += p0.x
                  currentLineSegment += p0.y
                }
              } else { //isEntering
                changedLine = true
                if (t >= 0f) { //Line starts not inside
                  val point = p0 + (p0p1 * t) // - (p0p1.norm * (0.5f * thickness))
                  println("deb p0: " + p0 + ", " + isFirstPoint)
                  if (isFirstPoint) {
                    currentLineSegment += p0.x
                    currentLineSegment += p0.y
                  }
                  currentLineSegment += point.x
                  currentLineSegment += point.y
                  returnPoints += currentLineSegment.toList
                  currentLineSegment = ListBuffer.empty[Float]
                }
              }
            }
          }
          println("deb currentLineSegment: " + currentLineSegment)
        }
      }
      //Add last Point if it is not inside
      if (currentLineSegment.nonEmpty) {
        currentLineSegment += p1.x
        currentLineSegment += p1.y
        returnPoints += currentLineSegment.toList
      }
    } else if (points.length == 2) { //only one point
      //ray casting to check if point is inside
      val p0 = Vec2(points(0), points(1))
      val outsidePoint = Vec2(-1, -1)
      var intersectionCount: Int = 0
      for ((defaultVert1, defaultVert2, expVec1, expVec2) <- polygonlist) {
        val vert1 = defaultVert1 + (expVec1 * (0.5f * thickness))
        val vert2 = defaultVert2 + (expVec2 * (0.5f * thickness))
        if (intersect(vert1, vert2, p0, outsidePoint)) {
          intersectionCount += 1
        }
      }
      if (intersectionCount % 2 != 0) { //point is inside
        changedLine = true
      }
    }
    if (changedLine) {
      println("deb returnPoints: " + returnPoints)
      Some(returnPoints.filter(_.nonEmpty).toList)
    } else {
      println("deb returnPoints: None")
      None
    }
    //val polys = polygonlist.map(l => l.foldLeft(ListBuffer.empty[Float])((buff, vec2) => buff ++ List(vec2.x, vec2.y)).toList)
    //val normals2 = polygonlist.zip(normals).map(z => z._1.zip(z._2).foldLeft(List.empty[List[Float]])((buff, zvec2) => buff :+ List(zvec2._1.x, zvec2._1.y, zvec2._1.x + zvec2._2.x, zvec2._1.y + +zvec2._2.y)))
    //polys ++ normals2.flatten
  }

  def clipBezierPoints(points: List[Float], commands: List[Int]): Option[List[List[Float]]] = {
    val convertedPoints: ListBuffer[Vec2] = ListBuffer.empty[Vec2]
    var remainingPoints = points
    for (command <- commands) {
      command match {
        case 1 => {
          val takenPoints = remainingPoints.take(2)
          convertedPoints += Vec2(takenPoints(0), takenPoints(1))
          remainingPoints = remainingPoints.drop(2)
        }
        case 2 => {
          val takenPoints = remainingPoints.take(4)
          convertedPoints += Vec2(takenPoints(0), takenPoints(1))
          convertedPoints += Vec2(takenPoints(2), takenPoints(3))
          remainingPoints = remainingPoints.drop(4)
        }
        case 3 => {

        }

        case _ => {}
      }
    }
    clipPoints(points, 0)
  }

  //From https://stackoverflow.com/questions/3838329/how-can-i-check-if-two-segments-intersect
  private def ccw(a: Vec2, b: Vec2, c: Vec2): Boolean = {
    (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x)
  }

  private def intersect(a: Vec2, b: Vec2, c: Vec2, d: Vec2): Boolean = {
    ccw(a, c, d) != ccw(b, c, d) && ccw(a, b, c) != ccw(a, b, d)
  }
}