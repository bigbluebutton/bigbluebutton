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

package org.bigbluebutton.fileupload.document.impl;
import javax.jms.Destination;
import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.Session;

import org.springframework.jms.core.JmsTemplate;
import org.springframework.jms.core.MessageCreator;


/**
 * This class has methods that are invoked to send update messages to the red5 presentation server application.
 * 
 * @author ritzalam
 */
public class UpdatesMessageSender {
    
    /** The template. */
    private JmsTemplate template = null;
    
    /** The destination. */
    private Destination destination = null;
    
    /**
     * setter for template.
     * 
     * @param template the template
     */
	public void setJmsTemplate(JmsTemplate template) {
		this.template = template;
	}
	
	/**
	 * Setter for destination.
	 * 
	 * @param destination the destination
	 */
	
	public void setDestination(Destination destination) {
		this.destination = destination;
	}
	
	/**
	 * This method sends the message string passed as a parameter to the destination.
	 * 
	 * @param room conference room ID
	 * @param code the code
	 * @param message update message
	 */
	public void sendMessage(final Integer room, final ReturnCode code, final String message) {
        template.send(destination, new MessageCreator() {
            public Message createMessage(Session session) throws JMSException {
            	Message msgToSend = session.createTextMessage(message);
            	msgToSend.setIntProperty("room", room);
            	msgToSend.setIntProperty("returnCode", code.value());
            	msgToSend.setStringProperty("message", message);
                return msgToSend;
            }
        });
	}
	
	/**
	 * This method is used to send presentation upload update message.
	 * 
	 * @param room conference room ID
	 * @param code the code
	 * @param totalNumSlides the total num slides
	 * @param curNumSlide the cur num slide
	 */
	public void sendMessage(final Integer room, final ReturnCode code, final int totalNumSlides, final int curNumSlide) {
        template.send(destination, new MessageCreator() {
            public Message createMessage(Session session) throws JMSException {
            	System.out.println("Sending message [" + room + " " + code.value() + " " + totalNumSlides + " " + curNumSlide + "]");
            	Message msgToSend = session.createTextMessage("Progress update");
            	msgToSend.setIntProperty("room", room);
            	msgToSend.setIntProperty("returnCode", code.value());
            	msgToSend.setIntProperty("totalSlides", totalNumSlides);
            	msgToSend.setIntProperty("slidesCompleted", curNumSlide);
            	
                return msgToSend;
            }
        });
	}
}
