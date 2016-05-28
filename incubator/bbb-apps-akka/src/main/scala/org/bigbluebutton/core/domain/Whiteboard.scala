package org.bigbluebutton.core.domain

case class AnnotationVO(
  id: String,
  status: String,
  shapeType: String,
  shape: scala.collection.immutable.Map[String, Object],
  wbId: String)

case class Whiteboard(id: String, shapes: Seq[AnnotationVO])
