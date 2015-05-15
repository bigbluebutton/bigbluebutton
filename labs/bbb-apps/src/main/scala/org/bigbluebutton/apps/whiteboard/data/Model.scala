package org.bigbluebutton.apps.whiteboard.data

import org.bigbluebutton.apps.users.data.UserIdAndName


                     
object ShapeTypes extends Enumeration {
	type ShapeType     = Value
	val LINE           = Value("LINE")
	val SCRIBBLE       = Value("SCRIBBLE")
	val TEXT           = Value("TEXT")
	val RECTANGLE      = Value("RECTANGLE")
	val ELLIPSE        = Value("ELLIPSE")
	val TRIANGLE       = Value("TRIANGLE")	
}

object LineTypes extends Enumeration {
	type LineType      = Value
	val SOLID          = Value("SOLID")
	val DASH           = Value("DASHED")
	val DOT            = Value("DOTTED")
	val DASHDOT        = Value("DASHEDOT")
}

case class ShapeDescriptor(whiteboardId: String, shapeId: String, 
                           shapeType: ShapeTypes.ShapeType, 
                           by: UserIdAndName)
                           
case class Shape(descriptor: ShapeDescriptor, 
                 shape: WhiteboardShape, zorder: Int)

sealed trait WhiteboardShape

class Container(coordinate: Coordinate, background: Background, 
                border: LineDescriptor)

case class Point(x: Double, y: Double)

case class Line(line: LineDescriptor, point1: Point, point2: Point)
                          extends WhiteboardShape
case class Scribble(line: LineDescriptor, points: Seq[Point]) 
                          extends WhiteboardShape

case class Background(visible: Boolean, color: Int, alpha: Int)

case class LineDescriptor(weight: Int, color: Int, lineType: LineTypes.LineType)

case class Coordinate(first: Point, last: Point)
case class Font(style: String, color: Int, size: Int)
case class Text(container: Container, font: Font, text: String) extends WhiteboardShape
                
case class Rectangle(container: Container, square: Boolean) extends WhiteboardShape                     
case class Ellipse(container: Container, circle: Boolean) extends WhiteboardShape                  
case class Triangle(container: Container) extends WhiteboardShape

class Whiteboard(id: String) {
  private var shapes = Seq[Shape]()
  
  private var orderCount = 0
  
  private def getOrder():Int = {
    val order = orderCount + 1
    orderCount = order
    order
  }
  
  def getShapes:Seq[Shape] = shapes.toSeq
  
  private def saveShape(s: Shape) = {
    shapes :+ s
  }
  
  def newShape(d: ShapeDescriptor, s: WhiteboardShape):Shape = {
    val order = getOrder()
    val shape = Shape(d, s, order)
    saveShape(shape)
    shape
  }
  
 // def removeShape()
  
}