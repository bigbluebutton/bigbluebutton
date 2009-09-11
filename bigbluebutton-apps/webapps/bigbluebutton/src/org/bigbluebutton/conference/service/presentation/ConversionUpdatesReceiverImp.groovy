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
import java.util.concurrent.Executorsimport java.util.concurrent.RejectedExecutionExceptionimport java.util.concurrent.ExecutorService
import javax.jms.Destination
import javax.jms.JMSException
import javax.jms.Message
import javax.jms.MapMessage
import org.apache.activemq.command.ActiveMQQueue
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.red5.logging.Red5LoggerFactory

import org.springframework.jms.core.JmsTemplate
import java.lang.RuntimeException

public class ConversionUpdatesReceiverImp implements ConversionUpdatesReceiver {
	private static Logger log = Red5LoggerFactory.getLogger(ConversionUpdatesReceiverImp.class, "bigbluebutton");

    private JmsTemplate template = null;    
    private Destination destination = null;  
    private volatile boolean waitForMessage = true;
    private ConversionUpdatesProcessor conversionUpdatesProcessor
    
	private final ExecutorService exec = Executors.newSingleThreadExecutor();	
	
	public void start() {
		log.debug "Starting conversion updates receiver."
		conversionUpdatesProcessor.start()
		
			try {
				// Create a Runnable (Closures implements Runnable) to receive the messages.
				Closure jmsReceiver = {
					log.debug "Waiting for JMS messages"
					while (waitForMessage) {
				        Message jmsMessage = template.receive(destination);
			        	
				        log.debug("Got JMS message.");
				        	
				        if (jmsMessage instanceof MapMessage) {
				        	try {
				               	MapMessage mapMessage = ((MapMessage) jmsMessage);
				               	handleReceivedMessage(mapMessage)							
				            } catch (JMSException ex) {
				            	log.error("Received an invalid JMS message: " + Message.toString());
				            }
				        }						
					}
	
				}
				exec.execute(jmsReceiver);				
			} catch (RejectedExecutionException e) {
				if (!exec.isShutdown())
					log.warn("RejectedExecutionException when trying to receive presentaion conversion updates.")
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
		waitForMessage = false;
		exec.shutdown()
	}

	public void setDestination(ActiveMQQueue destination) {
		log.debug("Setting destination")
		this.destination = (Destination) destination;
	}
	
	public void setJmsTemplate(JmsTemplate jmsTemplate) {
		log.debug("Setting jms template")
		this.template = jmsTemplate;
	}
	
	public void setConversionUpdatesProcessor(ConversionUpdatesProcessor p) {
		log.debug("Setting ConversionUpdatesProcessor")
		conversionUpdatesProcessor = p
	}	
}
