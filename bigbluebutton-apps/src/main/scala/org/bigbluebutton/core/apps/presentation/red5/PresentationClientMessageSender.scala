package org.bigbluebutton.core.apps.presentation.red5

import org.bigbluebutton.conference.meeting.messaging.red5.ConnectionInvokerService
import org.bigbluebutton.core.api._
import org.bigbluebutton.conference.meeting.messaging.red5.BroadcastClientMessage
import org.bigbluebutton.conference.meeting.messaging.red5.DirectClientMessage
import collection.JavaConversions._
import com.google.gson.Gson

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
      case msg: ClearPresentationOutMsg => 
                   handleClearPresentationOutMsg(msg)
      case msg: RemovePresentationOutMsg => 
                   handleRemovePresentationOutMsg(msg)
      case msg: GetPresentationInfoOutMsg => 
                   handleGetPresentationInfoOutMsg(msg)
      case msg: SendCursorUpdateOutMsg => 
                   handleSendCursorUpdateOutMsg(msg)
      case msg: ResizeAndMoveSlideOutMsg => 
                   handleResizeAndMoveSlideOutMsg(msg)
      case msg: GotoSlideOutMsg => 
                   handleGotoSlideOutMsg(msg)
      case msg: SharePresentationOutMsg => 
                   handleSharePresentationOutMsg(msg)
      case msg: GetSlideInfoOutMsg => 
                   handleGetSlideInfoOutMsg(msg)
      case msg: PresentationConversionProgress =>
                   handlePresentationConversionProgress(msg)
      case msg: PresentationConversionError =>
                   handlePresentationConversionError(msg)
      case msg: PresentationPageGenerated =>
                   handlePresentationPageGenerated(msg)
      case msg: PresentationConversionDone =>
                   handlePresentationConversionDone(msg)
      case _ => // do nothing
    }
  }
  
  private def handleClearPresentationOutMsg(msg: ClearPresentationOutMsg) {
      
  }
  
  private def handlePresentationConversionProgress(msg: PresentationConversionProgress) {
	val args = new java.util.HashMap[String, String]();
	args.put("meetingID", msg.meetingID);
	args.put("code", msg.code);
	args.put("presentationID", msg.presentationId);
	args.put("messageKey", msg.messageKey);
	
	val message = new java.util.HashMap[String, Object]() 
	val gson = new Gson();
  	message.put("msg", gson.toJson(args))
  	
  	println("PresentationClientMessageSender - handlePresentationConversionProgress \n" + message.get("msg") + "\n")
  	
    val m = new BroadcastClientMessage(msg.meetingID, "conversionUpdateMessageCallback", message);
	service.sendMessage(m);	
  }

  private def handlePresentationConversionError(msg: PresentationConversionError) {
    val args = new java.util.HashMap[String, String]();
	args.put("meetingID", msg.meetingID);
	args.put("code", msg.code);
	args.put("presentationID", msg.presentationId);
	args.put("messageKey", msg.messageKey);
	args.put("numberOfPages", msg.numberOfPages.toString);
	args.put("maxNumberPages", msg.maxNumberPages.toString);

	val message = new java.util.HashMap[String, Object]() 
	val gson = new Gson();
  	message.put("msg", gson.toJson(args))
  	
  	println("PresentationClientMessageSender - handlePresentationConversionError \n" + message.get("msg") + "\n")
  	
	val m = new BroadcastClientMessage(msg.meetingID, "pageCountExceededUpdateMessageCallback", message);
    service.sendMessage(m);    
  }

  private def handlePresentationPageGenerated(msg: PresentationPageGenerated) {
    val args = new java.util.HashMap[String, String]();
	args.put("meetingID", msg.meetingID);
	args.put("code", msg.code);
	args.put("presentationID", msg.presentationId);
	args.put("messageKey", msg.messageKey);
	args.put("numberOfPages", msg.numberOfPages.toString);
	args.put("maxNumberPages", msg.pagesCompleted.toString);

	val message = new java.util.HashMap[String, Object]() 
	val gson = new Gson();
  	message.put("msg", gson.toJson(args))
  	
  	println("PresentationClientMessageSender - handlePresentationPageGenerated \n" + message.get("msg") + "\n")
  	
	val m = new BroadcastClientMessage(msg.meetingID, "generatedSlideUpdateMessageCallback", message);
    service.sendMessage(m);    
  }
  
  private def handlePresentationConversionDone(msg: PresentationConversionDone) {
    val args = new java.util.HashMap[String, Object]();
	args.put("meetingID", msg.meetingID);
	args.put("code", msg.code);
	args.put("presentation", msg.presentation);

	val message = new java.util.HashMap[String, Object]() 
	val gson = new Gson();
  	message.put("msg", gson.toJson(args))
  	
  	println("PresentationClientMessageSender - handlePresentationConversionDone \n" + message.get("msg") + "\n")
  	
	val m = new BroadcastClientMessage(msg.meetingID, "conversionCompletedUpdateMessageCallback", message);
    service.sendMessage(m);      
  }

/*  
  private def handlePresentationConversionUpdateOutMsg(msg: PresentationConversionError) {
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
*/
  
  private def handleRemovePresentationOutMsg(msg: RemovePresentationOutMsg) {
		val args = new java.util.HashMap[String, Object]();
		args.put("presentationID", msg.presentationID);

		val m = new BroadcastClientMessage(msg.meetingID, "removePresentationCallback", args);
		service.sendMessage(m);    
  }
  
  private def handleGetPresentationInfoOutMsg(msg: GetPresentationInfoOutMsg) {
		val message = msg.info;
//		val m = new DirectClientMessage(msg.meetingID, msg.requesterID, "getPresentationInfoReply", msg.info);
//		service.sendMessage(m);	
  }
  
  private def handleSendCursorUpdateOutMsg(msg: SendCursorUpdateOutMsg) {
		 val args = new java.util.HashMap[String, Object]();
		 args.put("xPercent", msg.xPercent:java.lang.Double);
		 args.put("yPercent", msg.yPercent:java.lang.Double);

		val m = new BroadcastClientMessage(msg.meetingID, "PresentationCursorUpdateCommand", args);
		service.sendMessage(m);	    
  }
  
  private def handleResizeAndMoveSlideOutMsg(msg: ResizeAndMoveSlideOutMsg) {
//		val args = new java.util.HashMap[String, Object]();
//		args.put("xOffset", msg.xOffset);
//		args.put("yOffset", msg.yOffset:java.lang.Double);
//		args.put("widthRatio", msg.widthRatio:java.lang.Double);
//		args.put("heightRatio", msg.heightRatio:java.lang.Double);
		
//		val m = new BroadcastClientMessage(msg.meetingID, "moveCallback", args);
//		service.sendMessage(m);	    
  }
  
  private def handleGotoSlideOutMsg(msg: GotoSlideOutMsg) {
		val args = new java.util.HashMap[String, Object]();
//		args.put("pageNum", msg.slide:java.lang.Integer);
		
//		val m = new BroadcastClientMessage(msg.meetingID, "gotoSlideCallback", args);
//		service.sendMessage(m);	    
  }
  
  private def handleSharePresentationOutMsg(msg: SharePresentationOutMsg) {
		val args = new java.util.HashMap[String, Object]();
		args.put("presentationID", msg.presentationID);
		args.put("share", msg.share:java.lang.Boolean);
		
		val m = new BroadcastClientMessage(msg.meetingID, "sharePresentationCallback", args);
		service.sendMessage(m);	    
  }
  
  private def handleGetSlideInfoOutMsg(msg: GetSlideInfoOutMsg) {
//		val args = new java.util.HashMap[String, Object]();
//		args.put("xOffset", msg.xOffset:java.lang.Double);
//		args.put("yOffest", msg.yOffset:java.lang.Double);
//		args.put("widthRatio", msg.widthRatio:java.lang.Double);
//		args.put("heightRatio", msg.heightRatio:java.lang.Double);	
		
//		val m = new DirectClientMessage(msg.meetingID, msg.requesterID, "getPresentationInfoReply", args);
//		service.sendMessage(m);    
  }
}