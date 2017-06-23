package org.bigbluebutton.common2.domain

case class AnnotationVO(id: String, status: String, annotationType: String, annotationInfo: scala.collection.immutable.Map[String, Object], wbId: String, userId: String, position: Int)