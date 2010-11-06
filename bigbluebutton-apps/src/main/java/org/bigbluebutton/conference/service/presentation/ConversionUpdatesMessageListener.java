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

import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.MessageListener;
import javax.jms.MapMessage;
import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;

import java.util.HashMap;
import java.util.Map;

public class ConversionUpdatesMessageListener implements MessageListener{
	private static Logger log = Red5LoggerFactory.getLogger(ConversionUpdatesMessageListener.class, "bigbluebutton");
    
    private ConversionUpdatesProcessor conversionUpdatesProcessor;

	private static final String OFFICE_DOC_CONVERSION_SUCCESS_KEY = "OFFICE_DOC_CONVERSION_SUCCESS";
    private static final String OFFICE_DOC_CONVERSION_FAILED_KEY = "OFFICE_DOC_CONVERSION_FAILED";
    private static final String SUPPORTED_DOCUMENT_KEY = "SUPPORTED_DOCUMENT";
    private static final String UNSUPPORTED_DOCUMENT_KEY = "UNSUPPORTED_DOCUMENT";
    private static final String PAGE_COUNT_FAILED_KEY = "PAGE_COUNT_FAILED";
    private static final String PAGE_COUNT_EXCEEDED_KEY = "PAGE_COUNT_EXCEEDED";	
    private static final String GENERATED_SLIDE_KEY = "GENERATED_SLIDE";
    private static final String GENERATING_THUMBNAIL_KEY = "GENERATING_THUMBNAIL";
    private static final String GENERATED_THUMBNAIL_KEY = "GENERATED_THUMBNAIL";
    private static final String CONVERSION_COMPLETED_KEY = "CONVERSION_COMPLETED";
    
	public void start() {
		log.debug("Starting conversion updates receiver.");
		conversionUpdatesProcessor.start();
	}

	@Override
	public void onMessage(Message jmsMessage){
		if (jmsMessage instanceof MapMessage) {
        	MapMessage mapMessage = ((MapMessage) jmsMessage);
			handleReceivedMessage(mapMessage);
        }
	}
	
	@SuppressWarnings("unchecked")
	private void handleReceivedMessage(MapMessage mapMessage) {
    	try{
			String code = mapMessage.getString("returnCode");
	    	String room = mapMessage.getString("room");
	    	String presentationName = mapMessage.getString("presentationName");
	    	String conference = mapMessage.getString("conference");
	    	String messageKey = mapMessage.getString("messageKey");
	    	
			Map message = new HashMap();
	    	message.put("conference", conference);
			message.put("room", room);
			message.put("code", code);
			message.put("presentationName", presentationName);
			message.put("messageKey", messageKey);
			
			log.debug("JMS: {}[{}]",messageKey,presentationName);
			
			if(messageKey.equalsIgnoreCase(OFFICE_DOC_CONVERSION_SUCCESS_KEY)||
					messageKey.equalsIgnoreCase(OFFICE_DOC_CONVERSION_FAILED_KEY)||
					messageKey.equalsIgnoreCase(SUPPORTED_DOCUMENT_KEY)||
					messageKey.equalsIgnoreCase(UNSUPPORTED_DOCUMENT_KEY)||
					messageKey.equalsIgnoreCase(GENERATING_THUMBNAIL_KEY)||
					messageKey.equalsIgnoreCase(GENERATED_THUMBNAIL_KEY)||
					messageKey.equalsIgnoreCase(PAGE_COUNT_FAILED_KEY)){
				log.debug("JMS: {}[{}]",messageKey,presentationName);
				conversionUpdatesProcessor.process(message);
			}
			else if(messageKey.equalsIgnoreCase(PAGE_COUNT_EXCEEDED_KEY)){
				log.debug("JMS: {}[{}]",messageKey,presentationName);
				int numberOfPages = mapMessage.getInt("numberOfPages");
				int maxNumberPages = mapMessage.getInt("maxNumberPages");
				message.put("numberOfPages", numberOfPages);
				message.put("maxNumberPages", maxNumberPages);
				conversionUpdatesProcessor.process(message);
			}
			else if(messageKey.equalsIgnoreCase(GENERATED_SLIDE_KEY)){
				int numberOfPages = mapMessage.getInt("numberOfPages");
				int pagesCompleted = mapMessage.getInt("pagesCompleted");
				message.put("numberOfPages", numberOfPages);
				message.put("pagesCompleted", pagesCompleted);
				
				log.debug("JMS: {}[{}]",messageKey,presentationName);
				conversionUpdatesProcessor.process(message);
			}
			else if(messageKey.equalsIgnoreCase(CONVERSION_COMPLETED_KEY)){
				String slidesInfo = mapMessage.getString("slidesInfo");
				message.put("slidesInfo", slidesInfo);				
				log.debug("JMS: {}[{}]",messageKey,presentationName);
				conversionUpdatesProcessor.process(message);
			}
			else{
				log.error("Cannot handle recieved message.");
			}
    	}catch(JMSException ex){
    		log.warn(ex.getMessage());
    	}		
	}
	
	public void stop() {
		log.debug("Stopping conversion updates receiver.");
		conversionUpdatesProcessor.stop();
	}

	public void setConversionUpdatesProcessor(ConversionUpdatesProcessor p) {
		log.debug("Setting ConversionUpdatesProcessor");
		conversionUpdatesProcessor = p;
	}	
}
