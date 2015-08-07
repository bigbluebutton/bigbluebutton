package org.bigbluebutton.core.pubsub.senders

import org.bigbluebutton.core.api._
import org.bigbluebutton.core.messaging.Util
import org.bigbluebutton.core.apps.Page
import collection.JavaConverters._
import scala.collection.JavaConversions._

object PesentationMessageToJsonConverter {
  private def pageToMap(page: Page): java.util.Map[String, Any] = {
    val res = new scala.collection.mutable.HashMap[String, Any]
    res += "id" -> page.id
    res += "num" -> page.num
    res += "thumb_uri" -> page.thumbUri
    res += "swf_uri" -> page.swfUri
    res += "txt_uri" -> page.txtUri
    res += "svg_uri" -> page.svgUri
    res += "current" -> page.current
    res += "x_offset" -> page.xOffset
    res += "y_offset" -> page.yOffset
    res += "width_ratio" -> page.widthRatio
    res += "height_ratio" -> page.heightRatio

    mapAsJavaMap(res)
  }

  def clearPresentationOutMsgToJson(msg: ClearPresentationOutMsg): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)

    val header = Util.buildHeader(MessageNames.PRESENTATION_CLEARED, None)
    Util.buildJson(header, payload)
  }

  def removePresentationOutMsgToJson(msg: RemovePresentationOutMsg): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.PRESENTATION_ID, msg.presentationID)

    val header = Util.buildHeader(MessageNames.PRESENTATION_REMOVED, None)
    Util.buildJson(header, payload)
  }

  def getPresentationInfoOutMsgToJson(msg: GetPresentationInfoOutMsg): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.PRESENTATION_INFO, msg.info)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)

    val info = msg.info

    // Create a map for our current presenter
    val presenter = new java.util.HashMap[String, String]()
    presenter.put(Constants.USER_ID, info.presenter.userId)
    presenter.put(Constants.NAME, info.presenter.name)
    presenter.put(Constants.ASSIGNED_BY, info.presenter.assignedBy)

    payload.put(Constants.PRESENTER, presenter)

    // Create an array for our presentations
    val presentations = new java.util.ArrayList[java.util.HashMap[String, Object]]
    info.presentations.foreach { pres =>
      val presentation = new java.util.HashMap[String, Object]()
      presentation.put(Constants.ID, pres.id)
      presentation.put(Constants.NAME, pres.name)
      presentation.put(Constants.CURRENT, pres.current: java.lang.Boolean)

      // Get the pages for a presentation
      val pages = new java.util.ArrayList[java.util.Map[String, Any]]()
      pres.pages.values foreach { p =>
        pages.add(pageToMap(p))
      }
      // store the pages in the presentation 
      presentation.put(Constants.PAGES, pages)

      // add this presentation into our presentations list
      presentations.add(presentation);
    }

    // add the presentation to our map to complete our json
    payload.put(Constants.PRESENTATIONS, presentations)

    val header = Util.buildHeader(MessageNames.GET_PRESENTATION_INFO_REPLY, Some(msg.replyTo))
    Util.buildJson(header, payload)
  }

  def sendCursorUpdateOutMsgToJson(msg: SendCursorUpdateOutMsg): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.X_PERCENT, msg.xPercent)
    payload.put(Constants.Y_PERCENT, msg.yPercent)

    val header = Util.buildHeader(MessageNames.PRESENTATION_CURSOR_UPDATED, None)
    Util.buildJson(header, payload)
  }

  def resizeAndMoveSlideOutMsgToJson(msg: ResizeAndMoveSlideOutMsg): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.PAGE, pageToMap(msg.page))

    val header = Util.buildHeader(MessageNames.PRESENTATION_PAGE_RESIZED, None)
    Util.buildJson(header, payload)
  }

  def gotoSlideOutMsgToJson(msg: GotoSlideOutMsg): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.PAGE, pageToMap(msg.page))

    val header = Util.buildHeader(MessageNames.PRESENTATION_PAGE_CHANGED, None)
    Util.buildJson(header, payload)
  }

  def sharePresentationOutMsgToJson(msg: SharePresentationOutMsg): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)

    val presentation = new java.util.HashMap[String, Object]();
    presentation.put(Constants.ID, msg.presentation.id)
    presentation.put(Constants.NAME, msg.presentation.name)
    presentation.put(Constants.CURRENT, msg.presentation.current: java.lang.Boolean)

    // Get the pages for a presentation
    val pages = new java.util.ArrayList[java.util.Map[String, Any]]()
    msg.presentation.pages.values foreach { p =>
      pages.add(pageToMap(p))
    }

    // store the pages in the presentation 
    presentation.put(Constants.PAGES, pages)

    payload.put(Constants.PRESENTATION, presentation);

    val header = Util.buildHeader(MessageNames.PRESENTATION_SHARED, None)
    Util.buildJson(header, payload)
  }

  def getSlideInfoOutMsgToJson(msg: GetSlideInfoOutMsg): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.PAGE, pageToMap(msg.page))

    val header = Util.buildHeader(MessageNames.GET_SLIDE_INFO_REPLY, None)
    Util.buildJson(header, payload)
  }

  def getPreuploadedPresentationsOutMsgToJson(msg: GetPreuploadedPresentationsOutMsg): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)

    val header = Util.buildHeader(MessageNames.GET_PREUPLOADED_PRESENTATIONS, None)
    Util.buildJson(header, payload)
  }

  def presentationConversionProgressToJson(msg: PresentationConversionProgress): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.MESSAGE_KEY, msg.messageKey)
    payload.put(Constants.CODE, msg.code)
    payload.put(Constants.PRESENTATION_ID, msg.presentationId)
    payload.put(Constants.PRESENTATION_NAME, msg.presentationName)

    val header = Util.buildHeader(MessageNames.PRESENTATION_CONVERSION_PROGRESS, None)
    Util.buildJson(header, payload)
  }

  def presentationConversionErrorToJson(msg: PresentationConversionError): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.MESSAGE_KEY, msg.messageKey)
    payload.put(Constants.CODE, msg.code)
    payload.put(Constants.PRESENTATION_ID, msg.presentationId)
    payload.put(Constants.PRESENTATION_NAME, msg.presentationName)
    payload.put(Constants.NUM_PAGES, msg.numberOfPages)
    payload.put(Constants.MAX_NUM_PAGES, msg.maxNumberPages)

    val header = Util.buildHeader(MessageNames.PRESENTATION_CONVERSION_ERROR, None)
    Util.buildJson(header, payload)
  }

  def presentationPageGenerated(msg: PresentationPageGenerated): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.MESSAGE_KEY, msg.messageKey)
    payload.put(Constants.CODE, msg.code)
    payload.put(Constants.PRESENTATION_ID, msg.presentationId)
    payload.put(Constants.PRESENTATION_NAME, msg.presentationName)
    payload.put(Constants.NUM_PAGES, msg.numberOfPages)
    payload.put(Constants.PAGES_COMPLETED, msg.pagesCompleted)

    val header = Util.buildHeader(MessageNames.PRESENTATION_PAGE_GENERATED, None)
    Util.buildJson(header, payload)
  }

  def presentationConversionDoneToJson(msg: PresentationConversionDone): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.MESSAGE_KEY, msg.messageKey)
    payload.put(Constants.CODE, msg.code)

    val presentation = new java.util.HashMap[String, Object]();
    presentation.put(Constants.ID, msg.presentation.id)
    presentation.put(Constants.NAME, msg.presentation.name)
    presentation.put(Constants.CURRENT, msg.presentation.current: java.lang.Boolean)

    val pages = new java.util.ArrayList[java.util.Map[String, Any]]()
    msg.presentation.pages.values foreach { p =>
      pages.add(pageToMap(p))
    }

    presentation.put(Constants.PAGES, pages)

    payload.put(Constants.PRESENTATION, presentation);

    val header = Util.buildHeader(MessageNames.PRESENTATION_CONVERSION_DONE, None)
    Util.buildJson(header, payload)
  }

  def presentationChangedToJson(msg: PresentationChanged): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    val presentation = new java.util.HashMap[String, Object]();
    presentation.put(Constants.ID, msg.presentation.id)
    presentation.put(Constants.NAME, msg.presentation.name)
    presentation.put(Constants.CURRENT, msg.presentation.current: java.lang.Boolean)

    val pages = new java.util.ArrayList[java.util.Map[String, Any]]()
    msg.presentation.pages.values foreach { p =>
      pages.add(pageToMap(p))
    }

    presentation.put(Constants.PAGES, pages)
    payload.put(Constants.PRESENTATION, presentation);

    val header = Util.buildHeader(MessageNames.PRESENTATION_CHANGED, None)
    Util.buildJson(header, payload)
  }

  def getPresentationStatusReplyToJson(msg: GetPresentationStatusReply): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    val presentation = new java.util.HashMap[String, Object]();

    presentation.put(Constants.ID, msg.current.id)
    presentation.put(Constants.NAME, msg.current.name)
    presentation.put(Constants.CURRENT, msg.current.current: java.lang.Boolean)

    val pages = new java.util.ArrayList[java.util.Map[String, Any]]()

    msg.current.pages.values foreach { p =>
      pages.add(pageToMap(p))
    }

    presentation.put(Constants.PAGES, pages)

    payload.put(Constants.PRESENTATION, presentation);

    val header = Util.buildHeader(MessageNames.GET_PRESENTATION_STATUS_REPLY, Some(msg.replyTo))
    Util.buildJson(header, payload)
  }

  def presentationRemovedToJson(msg: PresentationRemoved): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.PRESENTATION_ID, msg.presentationId)

    val header = Util.buildHeader(MessageNames.PRESENTATION_REMOVED, None)
    Util.buildJson(header, payload)
  }

  def pageChangedToJson(msg: PageChanged): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.PAGE, pageToMap(msg.page))

    val header = Util.buildHeader(MessageNames.PRESENTATION_PAGE_CHANGED, None)
    Util.buildJson(header, payload)
  }
}