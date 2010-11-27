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
package org.bigbluebutton.conference.service.chat;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.so.ISharedObject;import org.red5.server.api.Red5;

public class ChatService
{
	
	private static Logger log = Red5LoggerFactory.getLogger( ChatService.class, "bigbluebutton" );
	
	private ChatApplication application;	

	public List<String> getChatMessages()
	{
		log.debug("getChatMessages was called");
		String roomName = Red5.getConnectionLocal().getScope().getName();
		return application.getChatMessages(roomName);
	}
	
	public void sendMessage(String message)
	{
		/*
		ISharedObject sharedObject = application.handler.getSharedObject(Red5.getConnectionLocal().getScope(), "chatSO");
		ArrayList<String> list=new ArrayList<String>();
		list.add(message);
		sharedObject.sendMessage("newChatMessage", list);
		*/
		
		String roomName = Red5.getConnectionLocal().getScope().getName();
		application.sendMessage(roomName, message);
	}
	public void setChatApplication(ChatApplication a)
	{
		log.debug("Setting Chat Applications");
		application = a;
	}
	
	public void privateMessage(String message, String sender, String recepient)
	{
		log.debug("Received private message: " + message + " from " + sender + " to " + recepient + " The client scope is: " + Red5.getConnectionLocal().getScope().getName());
		ISharedObject sharedObject = application.handler.getSharedObject(Red5.getConnectionLocal().getScope(), recepient);
		ArrayList<String> arguments = new ArrayList<String>();
		arguments.add(sender);
		arguments.add(message);
		sharedObject.sendMessage("messageReceived", arguments);
	}
}
