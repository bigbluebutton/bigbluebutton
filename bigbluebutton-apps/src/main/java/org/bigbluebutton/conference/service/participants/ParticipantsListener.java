
package org.bigbluebutton.conference.service.participants;

import java.util.HashMap;
import java.util.Map;

import org.apache.commons.lang.StringEscapeUtils;
import org.bigbluebutton.conference.service.messaging.MessagingConstants;
import org.bigbluebutton.conference.service.messaging.redis.MessageHandler;

import org.bigbluebutton.conference.service.presentation.ConversionUpdatesProcessor;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.google.gson.JsonParser;
import com.google.gson.JsonObject;


public class ParticipantsListener implements MessageHandler{
	
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
		if (channel.equalsIgnoreCase(MessagingConstants.ANTON_CHANNEL))
		{
			System.out.println("AntonChannel=(participants)" + channel);
			//System.out.println("AntonMessage=" + message);

			JsonParser parser = new JsonParser();
			JsonObject obj = (JsonObject) parser.parse(message);
			JsonObject header = (JsonObject) obj.get("header");
			//System.out.println ("header="+header);

			String eventName = (String) header.get("name").toString();
			eventName = eventName.replace("\"", "");//strip off quotations
			System.out.println("eventName="+eventName);

			if(eventName.equalsIgnoreCase("user_joined_event")) //put this string into a constants file
			{
				System.out.println("I'm in the case for joined_event" );
			}
			else if(eventName.equalsIgnoreCase("user_left_event")) //put this string into a constants file
			{
				System.out.println("I'm in the case for left_event" );
			}
		}
	}
}


