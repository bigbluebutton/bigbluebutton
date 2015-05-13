package org.bigbluebutton.apps.whiteboard

import org.bigbluebutton.apps.whiteboard.data._

class WhiteboardApp {
  private var whiteboards = new collection.immutable.HashMap[String, Whiteboard]()

  def addNewShape(descriptor: ShapeDescriptor, shape: WhiteboardShape): Shape = {
    whiteboards get (descriptor.whiteboardId) match {
      case Some(wb) => wb.newShape(descriptor, shape)
      case None => {
        val wb = new Whiteboard(descriptor.whiteboardId)
        wb.newShape(descriptor, shape)
      }
    }
  }
}