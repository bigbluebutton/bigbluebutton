package org.bigbluebutton.apps.presentation.data

case class Position(xOffset: Double = 0, yOffset: Double = 0,
  widthRatio: Double = 100, heightRatio: Double = 100)
case class Page(num: Int, location: String, position: Position)

case class PresentationIdAndName(id: String, name: String)
case class Presentation(id: String, name: String, currentPage: Int = 1,
  pages: Seq[Page])
