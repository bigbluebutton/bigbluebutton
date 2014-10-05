package org.bigbluebutton.core.apps.whiteboard.vo

case class AnnotationVO(id: String, status: String, shapeType: String, shape: scala.collection.immutable.Map[String, Object], wbId:String)