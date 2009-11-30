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
    	
		Map message = new HashMap()
		message.put('room', room)
		message.put('code', code)
		message.put('presentationName', presentationName)
		
		log.debug "JMS: ${code}[$presentationName]"
		
		switch (code) {
			case 'SUCCESS':
				log.debug "JMS: SUCCESS[$presentationName]"
												
				message.put('message', mapMessage.getStringProperty("message"))
				conversionUpdatesProcessor.process(message)
				break
			case 'THUMBNAILS':
				log.debug "JMS: THUMBNAILS[$presentationName]"
				conversionUpdatesProcessor.process(message)
				break
			case 'FAILED_CONVERT':
				log.debug "JMS: FAILED_CONVERT[$presentationName]"
				conversionUpdatesProcessor.process(message)
				break
			case 'CONVERT':
				def totalSlides = mapMessage.getInt("totalSlides")
				def completedSlides = mapMessage.getInt("slidesCompleted")
				message.put('totalSlides', totalSlides)
				message.put('completedSlides', completedSlides)
				
				log.debug "JMS: CONVERT[$presentationName, $completedSlides, $totalSlides]"
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
