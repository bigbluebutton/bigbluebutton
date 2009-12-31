/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * $Id: $
 */
package org.bigbluebutton.conference.service.presentation

import javax.jms.JMSException
import javax.jms.Message
import javax.jms.MessageListener
import javax.jms.MapMessage
import org.apache.activemq.command.ActiveMQQueue
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.red5.logging.Red5LoggerFactory

import java.lang.RuntimeException

public class ConversionUpdatesMessageListener implements MessageListener{
	private static Logger log = Red5LoggerFactory.getLogger(ConversionUpdatesMessageListener.class, "bigbluebutton");
    
    private ConversionUpdatesProcessor conversionUpdatesProcessor

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
		log.debug "Starting conversion updates receiver."
		conversionUpdatesProcessor.start()
	}

	@Override
	public void onMessage(Message jmsMessage){
		if (jmsMessage instanceof MapMessage) {
        	try {
               	MapMessage mapMessage = ((MapMessage) jmsMessage);
               	handleReceivedMessage(mapMessage)							
            } catch (JMSException ex) {
            	log.error("Received an invalid JMS message: " + jmsMessage.toString());
            }
        }
	}
	
	private void handleReceivedMessage(MapMessage mapMessage) {
    	def code = mapMessage.getString("returnCode")
    	def room = mapMessage.getString("room")
    	def presentationName = mapMessage.getString("presentationName")
    	def conference = mapMessage.getString("conference")
    	def messageKey = mapMessage.getString("messageKey")
    	
		Map message = new HashMap()
    	message.put('conference', conference)
		message.put('room', room)
		message.put('code', code)
		message.put('presentationName', presentationName)
		message.put('messageKey', messageKey)
		
		log.debug "JMS: ${messageKey}[$presentationName]"
		
		switch (messageKey) {
			case OFFICE_DOC_CONVERSION_SUCCESS_KEY :
			case OFFICE_DOC_CONVERSION_FAILED_KEY :
			case SUPPORTED_DOCUMENT_KEY :
			case UNSUPPORTED_DOCUMENT_KEY :
			case GENERATING_THUMBNAIL_KEY :
			case GENERATED_THUMBNAIL_KEY :
			case PAGE_COUNT_FAILED_KEY :
				log.debug "JMS: ${messageKey}[$presentationName]"
				conversionUpdatesProcessor.process(message)
				break
			
			case PAGE_COUNT_EXCEEDED_KEY :
				log.debug "JMS: ${messageKey}[$presentationName]"
				def numberOfPages = mapMessage.getInt("numberOfPages")
				def maxNumberPages = mapMessage.getInt("maxNumberPages")
				message.put('numberOfPages', numberOfPages)
				message.put('maxNumberPages', maxNumberPages)
				conversionUpdatesProcessor.process(message)
				break

			case GENERATED_SLIDE_KEY:
				def numberOfPages = mapMessage.getInt("numberOfPages")
				def pagesCompleted = mapMessage.getInt("pagesCompleted")
				message.put('numberOfPages', numberOfPages)
				message.put('pagesCompleted', pagesCompleted)
				
				log.debug "JMS: ${messageKey}[$presentationName]"
				conversionUpdatesProcessor.process(message)
				break
			case CONVERSION_COMPLETED_KEY:
				def slidesInfo = mapMessage.getString("slidesInfo")
				message.put('slidesInfo', slidesInfo)				
				log.debug "JMS: ${messageKey}[$presentationName]"
				conversionUpdatesProcessor.process(message)
				break
			default:
				log.error("Cannot handle recieved message.")
		}			
	}
	
	public void stop() {
		log.debug "Stopping conversion updates receiver."
		conversionUpdatesProcessor.stop()
	}

	public void setConversionUpdatesProcessor(ConversionUpdatesProcessor p) {
		log.debug("Setting ConversionUpdatesProcessor")
		conversionUpdatesProcessor = p
	}	
}
