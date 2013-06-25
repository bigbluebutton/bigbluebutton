package org.bigbluebutton.core.apps.presentation.red5

import org.bigbluebutton.conference.meeting.messaging.red5.ConnectionInvokerService
import org.bigbluebutton.core.api.OutMessageListener2
import org.bigbluebutton.core.api.IOutMessage
import org.bigbluebutton.core.api.ClearPresentationOutMsg
import org.bigbluebutton.core.api.PresentationConversionUpdateOutMsg
import org.bigbluebutton.core.api.RemovePresentationOutMsg
import org.bigbluebutton.core.api.GetPresentationInfoOutMsg
import org.bigbluebutton.core.api.SendCursorUpdateOutMsg
import org.bigbluebutton.core.api.ResizeAndMoveSlideOutMsg
import org.bigbluebutton.core.api.GotoSlideOutMsg
import org.bigbluebutton.core.api.SharePresentationOutMsg
import org.bigbluebutton.core.api.GetSlideInfoOutMsg
import org.bigbluebutton.conference.meeting.messaging.red5.BroadcastClientMessage
import org.bigbluebutton.conference.meeting.messaging.red5.DirectClientMessage
import collection.JavaConversions._

class PresentationClientMessageSender(service: ConnectionInvokerService) extends OutMessageListener2 {
	private val OFFICE_DOC_CONVERSION_SUCCESS_KEY = "OFFICE_DOC_CONVERSION_SUCCESS";
    private val OFFICE_DOC_CONVERSION_FAILED_KEY = "OFFICE_DOC_CONVERSION_FAILED";
    private val SUPPORTED_DOCUMENT_KEY = "SUPPORTED_DOCUMENT";
    private val UNSUPPORTED_DOCUMENT_KEY = "UNSUPPORTED_DOCUMENT";
    private val PAGE_COUNT_FAILED_KEY = "PAGE_COUNT_FAILED";
    private val PAGE_COUNT_EXCEEDED_KEY = "PAGE_COUNT_EXCEEDED";	
    private val GENERATED_SLIDE_KEY = "GENERATED_SLIDE";
    private val GENERATING_THUMBNAIL_KEY = "GENERATING_THUMBNAIL";
    private val GENERATED_THUMBNAIL_KEY = "GENERATED_THUMBNAIL";
    private val CONVERSION_COMPLETED_KEY = "CONVERSION_COMPLETED";
    
  def handleMessage(msg: IOutMessage) {
    msg match {
      case clearPresentationOutMsg: ClearPresentationOutMsg => handleClearPresentationOutMsg(clearPresentationOutMsg)
      case presentationConversionUpdateOutMsg: PresentationConversionUpdateOutMsg => handlePresentationConversionUpdateOutMsg(presentationConversionUpdateOutMsg)
      case removePresentationOutMsg: RemovePresentationOutMsg => handleRemovePresentationOutMsg(removePresentationOutMsg)
      case getPresentationInfoOutMsg: GetPresentationInfoOutMsg => handleGetPresentationInfoOutMsg(getPresentationInfoOutMsg)
      case sendCursorUpdateOutMsg: SendCursorUpdateOutMsg => handleSendCursorUpdateOutMsg(sendCursorUpdateOutMsg)
      case resizeAndMoveSlideOutMsg: ResizeAndMoveSlideOutMsg => handleResizeAndMoveSlideOutMsg(resizeAndMoveSlideOutMsg)
      case gotoSlideOutMsg: GotoSlideOutMsg => handleGotoSlideOutMsg(gotoSlideOutMsg)
      case sharePresentationOutMsg: SharePresentationOutMsg => handleSharePresentationOutMsg(sharePresentationOutMsg)
      case getSlideInfoOutMsg: GetSlideInfoOutMsg => handleGetSlideInfoOutMsg(getSlideInfoOutMsg)
      case _ => // do nothing
    }
  }
  
  private def handleClearPresentationOutMsg(msg: ClearPresentationOutMsg) {
      
  }
  
  private def handlePresentationConversionUpdateOutMsg(msg: PresentationConversionUpdateOutMsg) {
	  val message = msg.msg;

	  val messageKey:String = message.get("messageKey").asInstanceOf[String]

			  val args = new java.util.HashMap[String, Object]();
	  args.put("meetingID", message.get("conference"));
	  args.put("code", message.get("returnCode"));
	  args.put("presentationID", message.get("presentationName"));
	  args.put("messageKey", messageKey);

	  if (messageKey.equalsIgnoreCase(OFFICE_DOC_CONVERSION_SUCCESS_KEY) ||
			  messageKey.equalsIgnoreCase(OFFICE_DOC_CONVERSION_FAILED_KEY) ||
			  messageKey.equalsIgnoreCase(SUPPORTED_DOCUMENT_KEY) ||
			  messageKey.equalsIgnoreCase(UNSUPPORTED_DOCUMENT_KEY) ||
			  messageKey.equalsIgnoreCase(GENERATING_THUMBNAIL_KEY) ||
			  messageKey.equalsIgnoreCase(GENERATED_THUMBNAIL_KEY) ||
			  messageKey.equalsIgnoreCase(PAGE_COUNT_FAILED_KEY)){

		  val m = new BroadcastClientMessage(msg.meetingID, "conversionUpdateMessageCallback", args);

		  service.sendMessage(m);
	  } else if(messageKey.equalsIgnoreCase(PAGE_COUNT_EXCEEDED_KEY)){
		  args.put("numberOfPages", message.get("numberOfPages"));
		  args.put("maxNumberPages", message.get("maxNumberPages"));

		  val m = new BroadcastClientMessage(msg.meetingID, "pageCountExceededUpdateMessageCallback", args);

		  service.sendMessage(m);

	  } else if(messageKey.equalsIgnoreCase(GENERATED_SLIDE_KEY)){
		  args.put("numberOfPages", message.get("numberOfPages"));
		  args.put("pagesCompleted", message.get("pagesCompleted"));

		  val m = new BroadcastClientMessage(msg.meetingID, "generatedSlideUpdateMessageCallback", args);

		  service.sendMessage(m);			

	  } else if(messageKey.equalsIgnoreCase(CONVERSION_COMPLETED_KEY)){
		  args.put("slidesInfo", message.get("slidesInfo"));		

		  val m = new BroadcastClientMessage(msg.meetingID, "conversionCompletedUpdateMessageCallback", args);

		  service.sendMessage(m);			
	  }        
  }
  
  private def handleRemovePresentationOutMsg(msg: RemovePresentationOutMsg) {
		val args = new java.util.HashMap[String, Object]();
		args.put("presentationID", msg.presentationID);

		val m = new BroadcastClientMessage(msg.meetingID, "removePresentationCallback", args);
		service.sendMessage(m);    
  }
  
  private def handleGetPresentationInfoOutMsg(msg: GetPresentationInfoOutMsg) {
		val message = msg.info;
		val m = new DirectClientMessage(msg.meetingID, msg.requesterID, "getPresentationInfoReply", msg.info);
		service.sendMessage(m);	
  }
  
  private def handleSendCursorUpdateOutMsg(msg: SendCursorUpdateOutMsg) {
		 val args = new java.util.HashMap[String, Object]();
		 args.put("xPercent", msg.xPercent:java.lang.Double);
		 args.put("yPercent", msg.yPercent:java.lang.Double);

		val m = new BroadcastClientMessage(msg.meetingID, "PresentationCursorUpdateCommand", args);
		service.sendMessage(m);	    
  }
  
  private def handleResizeAndMoveSlideOutMsg(msg: ResizeAndMoveSlideOutMsg) {
		val args = new java.util.HashMap[String, Object]();
		args.put("xOffset", msg.xOffset:java.lang.Double);
		args.put("yOffset", msg.yOffset:java.lang.Double);
		args.put("widthRatio", msg.widthRatio:java.lang.Double);
		args.put("heightRatio", msg.heightRatio:java.lang.Double);
		
		val m = new BroadcastClientMessage(msg.meetingID, "moveCallback", args);
		service.sendMessage(m);	    
  }
  
  private def handleGotoSlideOutMsg(msg: GotoSlideOutMsg) {
		val args = new java.util.HashMap[String, Object]();
		args.put("pageNum", msg.slide:java.lang.Integer);
		
		val m = new BroadcastClientMessage(msg.meetingID, "gotoSlideCallback", args);
		service.sendMessage(m);	    
  }
  
  private def handleSharePresentationOutMsg(msg: SharePresentationOutMsg) {
		val args = new java.util.HashMap[String, Object]();
		args.put("presentationID", msg.presentationID);
		args.put("share", msg.share:java.lang.Boolean);
		
		val m = new BroadcastClientMessage(msg.meetingID, "sharePresentationCallback", args);
		service.sendMessage(m);	    
  }
  
  private def handleGetSlideInfoOutMsg(msg: GetSlideInfoOutMsg) {
		val args = new java.util.HashMap[String, Object]();
		args.put("xOffset", msg.xOffset:java.lang.Double);
		args.put("yOffest", msg.yOffset:java.lang.Double);
		args.put("widthRatio", msg.widthRatio:java.lang.Double);
		args.put("heightRatio", msg.heightRatio:java.lang.Double);	
		
		val m = new DirectClientMessage(msg.meetingID, msg.requesterID, "getPresentationInfoReply", args);
		service.sendMessage(m);    
  }
}