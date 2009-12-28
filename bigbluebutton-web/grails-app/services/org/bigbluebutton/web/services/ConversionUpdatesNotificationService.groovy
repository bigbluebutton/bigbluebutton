/* BigBlueButton - http://www.bigbluebutton.org
 * 
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
 * Author: Richard Alam <ritzalam@gmail.com>
 * 		   DJP <DJP@architectes.org>
 * 
 * @version $Id: $
 */
package org.bigbluebutton.web.services

import javax.jms.Message
import javax.jms.Session
import javax.jms.JMSException
import javax.jms.MapMessage
import org.springframework.jms.core.JmsTemplate

public class ConversionUpdatesNotificationService{
	boolean transactional = false
	def jmsTemplate	

	private void sendConvertErrorMessage(String conference, String room, String presName, File presentationFile, String returnCode) {
		def msg = new HashMap()
		msg.put("room", room)
		msg.put("returnCode", returnCode)
		msg.put("presentationName", presName)
		log.debug "Failed to convert $presentationFile.absolutePath to presentation file : " + returnCode
		println "Failed to convert $presentationFile.absolutePath to presentation file : " + returnCode
		sendJmsMessage(msg)
	}
	
	private void sendConversionUpdateMessage(String conference, String room, String presName, int totalSlides, int slidesCompleted) {
		def msg = new HashMap()
		msg.put("room", room)
		msg.put("returnCode", "CONVERT")
		msg.put("presentationName", presName)
		msg.put("totalSlides", new Integer(totalSlides))
		msg.put("slidesCompleted", new Integer(slidesCompleted))
		sendJmsMessage(msg)	
	}
	
	private void sendCreatingThumbnailsUpdateMessage(String conference, String room, String presName) {
		def msg = new HashMap()
		msg.put("room", room)
		msg.put("returnCode", "THUMBNAILS")
		msg.put("presentationName", presName)
		sendJmsMessage(msg)			
	}
	
	private void sendConversionCompletedMessage(String conference, String room, String presName, int numberOfPages) {		
		String xml = generateUploadedPresentationInfo(conference, room, presName, numberOfPages)
		
		println xml
		
		def msg = new HashMap()
		msg.put("room", room)
		msg.put("returnCode", "SUCCESS")
		msg.put("presentationName", presName)
		msg.put("message", xml)
		log.debug "Sending presentation conversion success for ${room} ${presName}."
		sendJmsMessage(msg)		
		log.debug "Send another success message...looks like bbb-apps at Red5 sometimes miss the message...need to investigate"
		sendJmsMessage(msg)
		
	}

	private String generateUploadedPresentationInfo(String conf, String confRoom, String presName, int numberOfPages) {
		def writer = new java.io.StringWriter()
		def builder = new groovy.xml.MarkupBuilder(writer)
		        		
		def uploadedpresentation = builder.uploadedpresentation {        
		    conference(id:conf, room:confRoom) {
		       presentation(name:presName) {
		          slides(count:numberOfPages) {
		             for (def i = 1; i <= numberOfPages; i++) {
		                slide(number:"${i}", name:"slide/${i}", thumb:"thumbnail/${i}")
		             }
		          }
		       }
			}
		}
	
		return writer.toString()
	}
	
	private sendJmsMessage(HashMap message) {
		def msg = message.toString()
		log.debug "Send Jms message $msg"
		jmsTemplate.convertAndSend(JMS_UPDATES_Q, message)
	}	
}
