package org.bigbluebutton.common2.domain

case class PresentationVO(id: String, temporaryPresentationId: String, name: String, current: Boolean = false,
                          pages: Vector[PageVO], downloadable: Boolean, removable: Boolean,
                          isInitialPresentation: Boolean, filenameConverted: String)

case class PageVO(id: String, num: Int, thumbUri: String = "",
                  txtUri: String, svgUri: String, current: Boolean = false, xOffset: Double = 0,
                  yOffset: Double = 0, widthRatio: Double = 100D, heightRatio: Double = 100D)

case class PresentationPodVO(id: String, currentPresenter: String,
                             presentations: Vector[PresentationVO])

case class PresentationPageConvertedVO(
    id:      String,
    num:     Int,
    urls:    Map[String, String],
    current: Boolean             = false
)

case class PresentationPageVO(
    id:          String,
    num:         Int,
    urls:        Map[String, String],
    current:     Boolean             = false,
    xOffset:     Double              = 0,
    yOffset:     Double              = 0,
    widthRatio:  Double              = 100D,
    heightRatio: Double              = 100D
)
