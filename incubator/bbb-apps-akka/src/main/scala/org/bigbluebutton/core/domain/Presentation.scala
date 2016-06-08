package org.bigbluebutton.core.domain

case class PresentationId(value: String) extends AnyVal

case class CurrentPresenter(id: IntUserId, name: Name, assignedBy: IntUserId)

case class CurrentPresentationInfo(presenter: CurrentPresenter, presentations: Seq[Presentation])

case class CursorLocation(xPercent: Double = 0D, yPercent: Double = 0D)

case class Presentation(
  id: String,
  name: String,
  current: Boolean = false,
  pages: scala.collection.immutable.HashMap[String, Page])

case class Page(
  id: String,
  num: Int,
  thumbUri: String = "",
  swfUri: String,
  txtUri: String,
  svgUri: String,
  current: Boolean = false,
  xOffset: Double = 0,
  yOffset: Double = 0,
  widthRatio: Double = 100D,
  heightRatio: Double = 100D)