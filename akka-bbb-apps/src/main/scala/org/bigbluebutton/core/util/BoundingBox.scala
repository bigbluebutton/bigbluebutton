package org.bigbluebutton.core.util

object ShapeType extends Enumeration {
  val Line, Rectangle, Ellipse = Value
}

class BoundingBox {
  var x1: Float = 0
  var y1: Float = 0
  var x2: Float = 0
  var y2: Float = 0

  def this(points: List[Float], thickness: Float, shape: ShapeType.Value) {
    this()
    shape match {
      case ShapeType.Line      => constructFromLinePoints(points)
      case ShapeType.Rectangle => constructFromRectanglePoints(points)
      case ShapeType.Ellipse   => constructFromRectanglePoints(points)
    }
    x1 -= thickness
    y1 -= thickness
    x2 += thickness
    y2 += thickness
  }

  private def constructFromLinePoints(points: List[Float]) = {
    if (points.length > 1) {
      this.x1 = points(0)
      this.y1 = points(1)
      this.x2 = points(0)
      this.y2 = points(1)
      var isXCoord: Boolean = true

      points.foreach(point => {
        if (isXCoord) {
          if (point < this.x1) {
            this.x1 = point
          }
          if (point > this.x2) {
            this.x2 = point
          }
        } else {
          if (point < this.y1) {
            this.y1 = point
          }
          if (point > this.y2) {
            this.y2 = point
          }
        }
        isXCoord = !isXCoord
      })
    }
  }

  private def constructFromRectanglePoints(points: List[Float]) = {
    if (points.length == 4) {
      this.x1 = points(0)
      this.y1 = points(1)
      this.x2 = points(2)
      this.y2 = points(3)
    }
  }

  def intersects(b: BoundingBox): Boolean = {
    // If one rectangle is on left side of other
    if (b.x1 >= this.x2 || this.x1 >= b.x2) {
      return false;
    }

    // If one rectangle is above other
    if (b.y1 >= this.y2 || this.y1 >= b.y2) {
      return false;
    }

    return true;
  }

}