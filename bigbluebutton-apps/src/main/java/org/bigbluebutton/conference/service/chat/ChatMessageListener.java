
package org.bigbluebutton.conference.service.chat;

import java.util.HashMap;
import java.util.Map;

import org.apache.commons.lang.StringEscapeUtils;
import org.bigbluebutton.conference.service.messaging.MessagingConstants;
import org.bigbluebutton.conference.service.messaging.redis.MessageHandler;

import org.bigbluebutton.conference.service.presentation.ConversionUpdatesProcessor;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

public class ChatMessageListener implements MessageHandler{
	public static final String OFFICE_DOC_CONVERSION_SUCCESS_KEY = "OFFICE_DOC_CONVERSION_SUCCESS";
	public static final String OFFICE_DOC_CONVERSION_FAILED_KEY = "OFFICE_DOC_CONVERSION_FAILED";
	public static final String SUPPORTED_DOCUMENT_KEY = "SUPPORTED_DOCUMENT";
	public static final String UNSUPPORTED_DOCUMENT_KEY = "UNSUPPORTED_DOCUMENT";
	public static final String PAGE_COUNT_FAILED_KEY = "PAGE_COUNT_FAILED";
	public static final String PAGE_COUNT_EXCEEDED_KEY = "PAGE_COUNT_EXCEEDED";	
	public static final String GENERATED_SLIDE_KEY = "GENERATED_SLIDE";
	public static final String GENERATING_THUMBNAIL_KEY = "GENERATING_THUMBNAIL";
	public static final String GENERATED_THUMBNAIL_KEY = "GENERATED_THUMBNAIL";
	public static final String CONVERSION_COMPLETED_KEY = "CONVERSION_COMPLETED";
	
	private ConversionUpdatesProcessor conversionUpdatesProcessor;
	
	public void setConversionUpdatesProcessor(ConversionUpdatesProcessor p) {
		conversionUpdatesProcessor = p;
	}	

	private void sendConversionUpdate(String messageKey, String conference, 
			                          String code, String presId, String filename) {
		conversionUpdatesProcessor.sendConversionUpdate(messageKey, conference,
				code, presId, filename);
	}
	
	public void sendPageCountError(String messageKey, String conference, 
            String code, String presId, Integer numberOfPages,
            Integer maxNumberPages, String filename) {
		conversionUpdatesProcessor.sendPageCountError(messageKey, conference, 
	            code, presId, numberOfPages,
	            maxNumberPages, filename);
	}
	
	private void sendSlideGenerated(String messageKey, String conference, 
            String code, String presId, Integer numberOfPages,
            Integer pagesCompleted, String filename) {
		conversionUpdatesProcessor.sendSlideGenerated(messageKey, conference, 
	            code, presId, numberOfPages,
	            pagesCompleted, filename);
	}
		
	private void sendConversionCompleted(String messageKey, String conference, 
            String code, String presId, Integer numberOfPages,
             String filename, String presBaseUrl) {
		
		conversionUpdatesProcessor.sendConversionCompleted(messageKey, conference,  
	            code, presId, numberOfPages, filename, presBaseUrl);
	}
	
	
	@Override
	public void handleMessage(String pattern, String channel, String message) {
		if (channel.equalsIgnoreCase(MessagingConstants.ANTON_CHANNEL)) {
			
			//ANTON added this for debugging purposes
			System.out.println("AntonChannel=" + channel);
			System.out.println("AntonMessage=" + message + "\n\n\n");
			
			Gson gson = new Gson();
			HashMap<String,String> map = gson.fromJson(message, new TypeToken<Map<String, String>>() {}.getType());			

			String toUsername = (String) map.get("toUsername");
	    	String chatMessage = (String) map.get("message");
	    	
	    	System.out.println("ANTON toUsername = " + toUsername);
	    	System.out.println("ANTON chatMessage = " + chatMessage);
	    				
		}
	}
}
