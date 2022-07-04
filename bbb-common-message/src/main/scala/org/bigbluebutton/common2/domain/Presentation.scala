package org.bigbluebutton.common2.domain

case class PresentationVO(id: String, temporaryPresentationId: String, name: String, current: Boolean = false,
                          pages: Vector[PageVO], downloadable: Boolean, removable: Boolean)

case class PageVO(id: String, num: Int, thumbUri: String = "", swfUri: String,
                  txtUri: String, svgUri: String, current: Boolean = false, xCamera: Double = 0,
                  yCamera: Double = 0, zoom: Double = 1D)

case class PresentationPodVO(id: String, currentPresenter: String,
                             presentations: Vector[PresentationVO])

case class PresentationPageConvertedVO(
    id:      String,
    num:     Int,
    urls:    Map[String, String],
    current: Boolean             = false
)

case class PresentationPageVO(
    id:      String,
    num:     Int,
    urls:    Map[String, String],
    current: Boolean             = false,
    xCamera: Double              = 0,
    yCamera: Double              = 0,
    zoom:    Double              = 1D
)
