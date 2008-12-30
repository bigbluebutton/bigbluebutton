/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2008 by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* This program is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with this program; if not, write to the Free Software Foundation, Inc.,
* 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
* 
*/
package org.bigbluebutton.presentation;

import javax.jms.Destination;
import javax.jms.JMSException;
import javax.jms.Message;

import org.apache.activemq.command.ActiveMQQueue;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.jms.core.JmsTemplate;


/**
 * The Class provides conversion update service to the client uploading the slides. 
 * It starts ConversionUpdatesServiceThread to listen to the messages passed by Servlet using ActiveMQ.
 * The messages received by the thread are routed to the presenter client.
 * 
 */
public class ConversionUpdatesService implements IConversionUpdatesService {
	
	/** The logger. */
	protected static Logger logger = LoggerFactory.getLogger(ConversionUpdatesService.class);

    /** The template. */
    private JmsTemplate template = null;
    
    /** The destination. */
    private Destination destination = null;
    
    /** The updates listener thread. */
    private volatile Thread updatesListenerThread;
    
    /** The wait for message. */
    private boolean waitForMessage = true;
	
    /** The updates listener. */
    private ConversionUpdatesListener updatesListener;
    
	/**
	 * Starts the service.
	 * @see org.bigbluebutton.presentation.IConversionUpdatesService#start()
	 */
	public void start() {
		
		ConversionUpdatesListenerThread listener = new ConversionUpdatesListenerThread();
		
		updatesListenerThread = new Thread(listener, "Conversion Updates Listener");
		updatesListenerThread.start();
	}

	/**
	 * Stops the service.
	 * @see org.bigbluebutton.presentation.IConversionUpdatesService#stop()
	 */
	public void stop() {
		waitForMessage = false;
	}

	/**
	 * @see org.bigbluebutton.presentation.IConversionUpdatesService#setDestination(org.apache.activemq.command.ActiveMQQueue)
	 */
	public void setDestination(ActiveMQQueue destination) {
		this.destination = (Destination) destination;
	}

	/**
	 * Setter for templete.
	 * 
	 * @see org.bigbluebutton.presentation.IConversionUpdatesService#setJmsTemplate(org.springframework.jms.core.JmsTemplate)
	 */
	public void setJmsTemplate(JmsTemplate jmsTemplate) {
		this.template = jmsTemplate;
	}
	
	/**
	 * The Class ConversionUpdatesListenerThread.
	 * listens to the messages passed by Servlet using ActiveMQ.
	 * Received messages are routed to the presenter client.
	 */
	private class ConversionUpdatesListenerThread implements Runnable
	{

		/**
		 * @see java.lang.Runnable#run()
		 */
		public void run() {
	        logger.info("Will wait for document conversion updates messages.");
	        
	        while (waitForMessage) {
	        	Message msg = template.receive(destination);
	        	
	        	int room;
				try {
					room = msg.getIntProperty("room");
					int code = msg.getIntProperty("returnCode");
					
					if (msg.propertyExists("message")) {
						String message = msg.getStringProperty("message");
						updatesListener.updateMessage(room, code, message);
					} else if (msg.propertyExists("totalSlides")) {
						int totalSlides = msg.getIntProperty("totalSlides");
						int completedSlides = msg.getIntProperty("slidesCompleted");
						updatesListener.updateMessage(room, code, totalSlides, completedSlides);
					} else {
						logger.error("Cannot handle recieved message.");
					}
		        	System.out.println("Room = [" + room + "," + code + "]");
//		        	System.out.println("Message=[" + message + "]");
		        	
				} catch (JMSException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
	        }
		}
		
	}

	/**
	 * Sets the updates listener.
	 * 
	 * @param updatesListener the new updates listener
	 */
	public void setUpdatesListener(ConversionUpdatesListener updatesListener) {
		this.updatesListener = updatesListener;
	}
}
