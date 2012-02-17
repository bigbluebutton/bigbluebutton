/**
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
*/
package org.bigbluebutton.conference.service.chat;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.so.ISharedObject;import org.red5.server.api.Red5;

public class ChatService {
	
	private static Logger log = Red5LoggerFactory.getLogger( ChatService.class, "bigbluebutton" );
	
	private ChatApplication application;

	public List<ChatObject> getChatMessages() {
		String roomName = Red5.getConnectionLocal().getScope().getName();
		return application.getChatMessages(roomName);
	}
	
	//public void sendMessage(String message, String username, String color, String time, String language, String userid) {
	public void sendMessage(ChatObject chatobj) {
		String roomName = Red5.getConnectionLocal().getScope().getName();
		application.sendMessage(roomName, chatobj);
	}
	public void setChatApplication(ChatApplication a) {
		log.debug("Setting Chat Applications");
		application = a;
	}
	
	public void privateMessage(ChatObject chatobj, String sender, String receiver){
		log.debug("Received private message: " + chatobj.message + " from " + sender + " to " + receiver + ". The client scope is: " + Red5.getConnectionLocal().getScope().getName());
		ISharedObject sharedObject = application.handler.getSharedObject(Red5.getConnectionLocal().getScope(), receiver);
		if (sharedObject != null) {
			ArrayList<Object> arguments = new ArrayList<Object>();
			arguments.add(sender);
			arguments.add(chatobj);
			sharedObject.sendMessage("messageReceived", arguments);			
		} else {
			log.debug("Not sending private message from " + sender + " to " + receiver + " as the user may have already left.");
		}

	}
}
