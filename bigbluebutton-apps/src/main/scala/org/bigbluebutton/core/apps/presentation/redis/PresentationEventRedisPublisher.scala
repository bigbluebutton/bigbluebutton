package org.bigbluebutton.core.apps.presentation.redis

import org.bigbluebutton.core.api.OutMessageListener2
import org.bigbluebutton.core.apps.presentation.Page
import org.bigbluebutton.conference.service.messaging.redis.MessageSender
import org.bigbluebutton.core.api._
import org.bigbluebutton.red5.pub.messages.MessagingConstants
import org.bigbluebutton.red5.sub.messages.PresentationRemovedMessage
import collection.JavaConverters._
import scala.collection.JavaConversions._
import org.bigbluebutton.red5.pub.messages.GetPresentationInfoReplyMessage

class PresentationEventRedisPublisher(service: MessageSender) extends OutMessageListener2 { 
  def handleMessage(msg: IOutMessage) {
    msg match {
      case msg: ClearPresentationOutMsg             => handleClearPresentationOutMsg(msg)
      case msg: RemovePresentationOutMsg            => handleRemovePresentationOutMsg(msg)
      case msg: GetPresentationInfoOutMsg           => handleGetPresentationInfoOutMsg(msg)
      case msg: SendCursorUpdateOutMsg              => handleSendCursorUpdateOutMsg(msg)
      case msg: ResizeAndMoveSlideOutMsg            => handleResizeAndMoveSlideOutMsg(msg)
      case msg: GotoSlideOutMsg                     => handleGotoSlideOutMsg(msg)
      case msg: SharePresentationOutMsg             => handleSharePresentationOutMsg(msg)
      case msg: GetSlideInfoOutMsg                  => handleGetSlideInfoOutMsg(msg)
      case msg: PresentationConversionProgress      => handlePresentationConversionProgress(msg)
      case msg: PresentationConversionError         => handlePresentationConversionError(msg)
      case msg: PresentationPageGenerated           => handlePresentationPageGenerated(msg)
      case msg: PresentationConversionDone          => handlePresentationConversionDone(msg)
      case _ => // do nothing
    }
  }
  
  private def pageToMap(page: Page):java.util.Map[String, Any] = {
    val res = new scala.collection.mutable.HashMap[String, Any]
    res += "id"           -> page.id
    res += "num"          -> page.num
    res += "thumb_uri"    -> page.thumbUri
    res += "swf_uri"      -> page.swfUri
    res += "txt_uri"      -> page.txtUri
    res += "png_uri"      -> page.pngUri
    res += "current"      -> page.current
    res += "x_offset"     -> page.xOffset
    res += "y_offset"     -> page.yOffset
    res += "width_ratio"  -> page.widthRatio
    res += "height_ratio" -> page.heightRatio
    
    mapAsJavaMap(res)
  }
    
  private def handleClearPresentationOutMsg(msg: ClearPresentationOutMsg) {
    val json = PesentationMessageToJsonConverter.clearPresentationOutMsgToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }
  
  private def handleRemovePresentationOutMsg(msg: RemovePresentationOutMsg) {
    val m = new PresentationRemovedMessage(msg.meetingID, msg.presentationID)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, m.toJson())
  }
  
  private def handleGetPresentationInfoOutMsg(msg: GetPresentationInfoOutMsg) {
     // Create a map for our current presenter
    val presenter = new java.util.HashMap[String, Object]()
    presenter.put(Constants.USER_ID, msg.info.presenter.userId)
    presenter.put(Constants.NAME, msg.info.presenter.name)
    presenter.put(Constants.ASSIGNED_BY, msg.info.presenter.assignedBy)
    
    // Create an array for our presentations
    val presentations = new java.util.ArrayList[java.util.Map[String, Object]]     
    msg.info.presentations.foreach { pres =>
      val presentation = new java.util.HashMap[String, Object]()
      presentation.put(Constants.ID, pres.id)
      presentation.put(Constants.NAME, pres.name)
      presentation.put(Constants.CURRENT, pres.current:java.lang.Boolean)      
     
      // Get the pages for a presentation
      val pages = new java.util.ArrayList[java.util.Map[String, Any]]() 
      pres.pages.values foreach {p =>
        pages.add(pageToMap(p))
      }   
      // store the pages in the presentation 
      presentation.put(Constants.PAGES, pages)
  
      // add this presentation into our presentations list
      presentations.add(presentation);     
    }    
    
    val reply = new GetPresentationInfoReplyMessage(msg.meetingID, msg.requesterID, presenter, presentations) 
    
    val json = PesentationMessageToJsonConverter.getPresentationInfoOutMsgToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }
  
  private def handleSendCursorUpdateOutMsg(msg: SendCursorUpdateOutMsg) {
    val json = PesentationMessageToJsonConverter.sendCursorUpdateOutMsgToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }
  
  private def handleResizeAndMoveSlideOutMsg(msg: ResizeAndMoveSlideOutMsg) {
    val json = PesentationMessageToJsonConverter.resizeAndMoveSlideOutMsgToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }
  
  private def handleGotoSlideOutMsg(msg: GotoSlideOutMsg) {
    val json = PesentationMessageToJsonConverter.gotoSlideOutMsgToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }
  
  private def handleSharePresentationOutMsg(msg: SharePresentationOutMsg) {
    val json = PesentationMessageToJsonConverter.sharePresentationOutMsgToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }
  
  private def handleGetSlideInfoOutMsg(msg: GetSlideInfoOutMsg) {
    val json = PesentationMessageToJsonConverter.getSlideInfoOutMsgToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }
  
  private def handleGetPreuploadedPresentationsOutMsg(msg: GetPreuploadedPresentationsOutMsg) {
    val json = PesentationMessageToJsonConverter.getPreuploadedPresentationsOutMsgToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }
  
  private def handlePresentationConversionProgress(msg: PresentationConversionProgress) {
    val json = PesentationMessageToJsonConverter.presentationConversionProgressToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }
  
  private def handlePresentationConversionError(msg: PresentationConversionError) {
    val json = PesentationMessageToJsonConverter.presentationConversionErrorToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)    
  }
  
  private def handlePresentationPageGenerated(msg: PresentationPageGenerated) {
    val json = PesentationMessageToJsonConverter.presentationPageGenerated(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)      
  }
  
  private def handlePresentationConversionDone(msg: PresentationConversionDone) {
    val json = PesentationMessageToJsonConverter.presentationConversionDoneToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)    
  }
  
  private def handlePresentationChanged(msg: PresentationChanged) {
    val json = PesentationMessageToJsonConverter.presentationChangedToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)   
  }
  
  private def handleGetPresentationStatusReply(msg: GetPresentationStatusReply) {
    val json = PesentationMessageToJsonConverter.getPresentationStatusReplyToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)  
  }
  
  private def handlePresentationRemoved(msg: PresentationRemoved) {    
    val json = PesentationMessageToJsonConverter.presentationRemovedToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)     
  }
  
  private def handlePageChanged(msg: PageChanged) {
    val json = PesentationMessageToJsonConverter.pageChangedToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)  
  }  
}