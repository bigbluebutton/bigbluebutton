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

import javax.jms.Destination;
import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.MapMessage;
import org.apache.activemq.command.ActiveMQQueue;
import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;

import org.springframework.jms.core.JmsTemplate;
import java.lang.RuntimeException;
import java.util.HashMap;
import java.util.Map;

public class ConversionUpdatesService { 
	private static Logger log = Red5LoggerFactory.getLogger(ConversionUpdatesService.class, "bigbluebutton");

    private JmsTemplate template = null;    
    private Destination destination = null;  
    private boolean waitForMessage = true;
    private PresentationApplication presentationApplication;
    
    private static String APP = "PRESENTATION ";
    
    public ConversionUpdatesService() {
    	log.debug("In ConversionUpdatesService constructor");
    }
    
	@SuppressWarnings("unchecked")
	public void start() {
		Thread thread = new Thread(new Runnable() {
			
			@Override
			public void run() {
				log.info("{} - Will wait for document conversion updates messages.",APP);
		        
		        while (waitForMessage) {
		        	Message jmsMessage = template.receive(destination);
		        	
		        	log.debug("{} - Got JMS message.",APP);
		        	
		        	if (jmsMessage instanceof MapMessage) {
		                try {
		                	MapMessage mapMessage = ((MapMessage) jmsMessage);

		                	String code = mapMessage.getString("returnCode");
		                	String room = mapMessage.getString("room");
		                	String presentationName = mapMessage.getString("presentationName");
		                	
							Map message = new HashMap();
							message.put("room", room);
							message.put("code", code);
							message.put("presentationName", presentationName);
							if(code.equalsIgnoreCase("SUCCESS")){
								log.debug("JMS: SUCCESS[{}]",presentationName);
								message.put("message", mapMessage.getStringProperty("message"));
								presentationApplication.sendUpdateMessage(message);
							}
							else if(code.equalsIgnoreCase("FAILED_CONVERT_FORMAT")||
									code.equalsIgnoreCase("FAILED_CONVERT_NOT_SUPPORTED")||
									code.equalsIgnoreCase("FAILED_CONVERT_SOFFICE")||
									code.equalsIgnoreCase("FAILED_CONVERT_NBPAGE")||
									code.equalsIgnoreCase("FAILED_CONVERT_MAXNBPAGE_REACH")||
									code.equalsIgnoreCase("FAILED_CONVERT_SWF")||
									code.equalsIgnoreCase("FAILED_CONVERT_SWF_IMAGE")||
									code.equalsIgnoreCase("FAILED_CONVERT_SWF_PDF")||
									code.equalsIgnoreCase("FAILED_CONVERT_THUMBNAIL")){
								log.debug("JMS: {}[{}]",code,presentationName);
								presentationApplication.sendUpdateMessage(message);
							}
							else if(code.equalsIgnoreCase("FAILED")||
									code.equalsIgnoreCase("FAILED_CONVERT")){
								log.debug("JMS: FAILED[{}]",presentationName);
								message.put("message", mapMessage.getStringProperty("message"));
								presentationApplication.sendUpdateMessage(message);
							}
							else if(code.equalsIgnoreCase("EXTRACT")||
									code.equalsIgnoreCase("CONVERT")){
								int totalSlides = mapMessage.getInt("totalSlides");
								int completedSlides = mapMessage.getInt("slidesCompleted");
								message.put("totalSlides", totalSlides);
								message.put("completedSlides", completedSlides);
								
								log.debug("JMS: CONVERT["+presentationName+", "+completedSlides+", "+totalSlides+"]");
								presentationApplication.sendUpdateMessage(message);
							}
							else{
								log.error("Cannot handle recieved message.");
							}						
		                }
		                catch (JMSException ex) {
		                    throw new RuntimeException(ex);
		                }
		            }
		        }
			}
		});
		thread.start();
	}

	public void stop() {
		waitForMessage = false;
	}

	public void setDestination(ActiveMQQueue destination) {
		log.debug("Setting destination");
		this.destination = (Destination) destination;
	}
	
	public void setJmsTemplate(JmsTemplate jmsTemplate) {
		log.debug("Setting jms template");
		this.template = jmsTemplate;
	}
	
	public void setPresentationApplication(PresentationApplication a) {
		log.debug("Setting presentation application");
		presentationApplication = a;
	}
}
