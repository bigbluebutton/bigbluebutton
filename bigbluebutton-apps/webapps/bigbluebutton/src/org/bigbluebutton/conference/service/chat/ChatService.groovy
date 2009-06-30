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
package org.bigbluebutton.conference.service.chat
import org.slf4j.Loggerimport org.slf4j.LoggerFactory
import org.red5.logging.Red5LoggerFactory
import org.red5.server.api.Red5
public class ChatService {
	
	private static Logger log = Red5LoggerFactory.getLogger( ChatService.class, "bigbluebutton" );
	
	private ChatApplication application

	public String getChatMessages() {
		String roomName = Red5.connectionLocal.scope.name
		return application.getChatMessages(roomName)
	}
	
	public void sendMessage(String message) {
		String roomName = Red5.connectionLocal.scope.name
		application.sendMessage(roomName, message)
	}
	public void setChatApplication(ChatApplication a) {
		log.debug("Setting Chat Applications")
		application = a
	}
}
