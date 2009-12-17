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

public class ConversionUpdatesService { 
	private static Logger log = Red5LoggerFactory.getLogger(ConversionUpdatesService.class, "bigbluebutton");

    private JmsTemplate template = null;    
    private Destination destination = null;  
    private boolean waitForMessage = true;
    private PresentationApplication presentationApplication
    
    private static String APP = "PRESENTATION ";
    
    public ConversionUpdatesService() {
    	log.debug("In ConversionUpdatesService constructor")
    }
    
	public void start() {
		
		Thread.start {
	        log.info("${APP} - Will wait for document conversion updates messages.");
	        
	        while (waitForMessage) {
	        	Message jmsMessage = template.receive(destination);
	        	
	        	log.debug("${APP} - Got JMS message.");
	        	
	        	if (jmsMessage instanceof MapMessage) {
	                try {
	                	MapMessage mapMessage = ((MapMessage) jmsMessage);

	                	def code = mapMessage.getString("returnCode")
	                	def room = mapMessage.getString("room")
	                	def presentationName = mapMessage.getString("presentationName")
	                	
						Map message = new HashMap()
						message.put('room', room)
						message.put('code', code)
						message.put('presentationName', presentationName)
						
						switch (code) {
							case 'SUCCESS':
								log.debug "JMS: SUCCESS[$presentationName]"
																
								message.put('message', mapMessage.getStringProperty("message"))
								presentationApplication.sendUpdateMessage(message)
								break
							case 'FAILED_CONVERT_FORMAT':
							case 'FAILED_CONVERT_NOT_SUPPORTED':
							case 'FAILED_CONVERT_SOFFICE':
							case 'FAILED_CONVERT_NBPAGE':
							case 'FAILED_CONVERT_MAXNBPAGE_REACH':
							case 'FAILED_CONVERT_SWF':
							case 'FAILED_CONVERT_SWF_IMAGE':
							case 'FAILED_CONVERT_SWF_PDF':
							case 'FAILED_CONVERT_THUMBNAIL':
								log.debug "JMS: ${code}[$presentationName]"
								presentationApplication.sendUpdateMessage(message)
								break;
							/* Obsolete */
							case 'FAILED':
							case 'FAILED_CONVERT':
								log.debug "JMS: FAILED[$presentationName]"

								message.put('message', mapMessage.getStringProperty("message"))
								presentationApplication.sendUpdateMessage(message)
						
								break;
							case 'EXTRACT':
							case 'CONVERT':
								def totalSlides = mapMessage.getInt("totalSlides")
								def completedSlides = mapMessage.getInt("slidesCompleted")
								message.put('totalSlides', totalSlides)
								message.put('completedSlides', completedSlides)
								
								log.debug "JMS: CONVERT[$presentationName, $completedSlides, $totalSlides]"
								presentationApplication.sendUpdateMessage(message)
								break
							default:
								log.error("Cannot handle recieved message.")
						}						
	                }
	                catch (JMSException ex) {
	                    throw new RuntimeException(ex);
	                }
	            }
	        }
		}
	}

	public void stop() {
		waitForMessage = false;
	}

	public void setDestination(ActiveMQQueue destination) {
		log.debug("Setting destination")
		this.destination = (Destination) destination;
	}
	
	public void setJmsTemplate(JmsTemplate jmsTemplate) {
		log.debug("Setting jms template")
		this.template = jmsTemplate;
	}
	
	public void setPresentationApplication(PresentationApplication a) {
		log.debug("Setting presentation application")
		presentationApplication = a
	}
}
