package org.bigbluebutton.common2.domain

case class PresentationVO(id: String, name: String, current: Boolean = false,
  pages: Vector[PageVO], downloadable: Boolean)

case class PageVO(id: String, num: Int, thumbUri: String = "", swfUri: String, 
  txtUri: String, svgUri: String, current: Boolean = false, xOffset: Double = 0,
  yOffset: Double = 0, widthRatio: Double = 100D, heightRatio: Double = 100D)

case class PresentationPodVO(id: String, ownerId: String, currentPresenter: String,
                           authorizedPresenters: Vector[String],
                           presentations: Vector[PresentationVO])
