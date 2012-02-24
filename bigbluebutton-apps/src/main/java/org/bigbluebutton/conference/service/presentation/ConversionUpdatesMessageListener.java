/** 
* ===License Header===
*
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
* 
* ===License Header===
*/
package org.bigbluebutton.conference.service.presentation;

import org.slf4j.Logger;
import org.apache.commons.lang.StringEscapeUtils;
import org.red5.logging.Red5LoggerFactory;

import java.util.HashMap;
import java.util.Map;

public class ConversionUpdatesMessageListener {
	private static Logger log = Red5LoggerFactory.getLogger(ConversionUpdatesMessageListener.class, "bigbluebutton");
    
    private ConversionUpdatesProcessor conversionUpdatesProcessor;

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
    
	public void start() {
		log.debug("Starting conversion updates receiver.");
	}
	
	@SuppressWarnings({ "unchecked", "rawtypes" })
	public void handleReceivedMessage(Map mapMessage) {
    	try{
			String code = (String) mapMessage.get("returnCode");
	    	String room = (String) mapMessage.get("room");
	    	String presentationName = (String) mapMessage.get("presentationName");
	    	String conference = (String) mapMessage.get("conference");
	    	String messageKey = (String) mapMessage.get("messageKey");
	    	
			Map message = new HashMap();
	    	message.put("conference", conference);
			message.put("room", room);
			message.put("code", code);
			message.put("presentationName", presentationName);
			message.put("messageKey", messageKey);
			
			log.debug("Message: " + messageKey + "[ " + presentationName + "]");
			
			if(messageKey.equalsIgnoreCase(OFFICE_DOC_CONVERSION_SUCCESS_KEY)||
					messageKey.equalsIgnoreCase(OFFICE_DOC_CONVERSION_FAILED_KEY)||
					messageKey.equalsIgnoreCase(SUPPORTED_DOCUMENT_KEY)||
					messageKey.equalsIgnoreCase(UNSUPPORTED_DOCUMENT_KEY)||
					messageKey.equalsIgnoreCase(GENERATING_THUMBNAIL_KEY)||
					messageKey.equalsIgnoreCase(GENERATED_THUMBNAIL_KEY)||
					messageKey.equalsIgnoreCase(PAGE_COUNT_FAILED_KEY)){
				
				conversionUpdatesProcessor.process(message);
			}
			else if(messageKey.equalsIgnoreCase(PAGE_COUNT_EXCEEDED_KEY)){
				Integer numberOfPages = new Integer((String) mapMessage.get("numberOfPages"));
				Integer maxNumberPages = new Integer((String) mapMessage.get("maxNumberPages"));
				message.put("numberOfPages", numberOfPages);
				message.put("maxNumberPages", maxNumberPages);
				conversionUpdatesProcessor.process(message);
			}
			else if(messageKey.equalsIgnoreCase(GENERATED_SLIDE_KEY)){
				Integer numberOfPages = new Integer((String)mapMessage.get("numberOfPages"));
				Integer pagesCompleted = new Integer((String)mapMessage.get("pagesCompleted"));
				message.put("numberOfPages", numberOfPages);
				message.put("pagesCompleted", pagesCompleted);
				
				conversionUpdatesProcessor.process(message);
			}
			else if(messageKey.equalsIgnoreCase(CONVERSION_COMPLETED_KEY)){
				String slidesInfo = (String) mapMessage.get("slidesInfo");
				message.put("slidesInfo", StringEscapeUtils.unescapeXml(slidesInfo));				
				conversionUpdatesProcessor.process(message);
			}
			else{
				log.error("Cannot handle recieved message.");
			}
    	}catch(Exception ex){
    		log.warn(ex.getMessage());
    	}		
	}
	
	public void stop() {
		log.debug("Stopping conversion updates receiver.");
	}

	public void setConversionUpdatesProcessor(ConversionUpdatesProcessor p) {
		log.debug("Setting ConversionUpdatesProcessor");
		conversionUpdatesProcessor = p;
	}	
}
