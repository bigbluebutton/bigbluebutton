package org.bigbluebutton.core.apps.whiteboard.messages


case class Annotation(id: String, status: String, shapeType: String, shape: Map[String, Object])

