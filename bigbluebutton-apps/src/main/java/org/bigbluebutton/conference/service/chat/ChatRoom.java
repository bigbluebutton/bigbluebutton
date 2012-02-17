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

import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;

import net.jcip.annotations.ThreadSafe;import java.util.concurrent.ConcurrentHashMap;import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
/**
 * Contains information about a ChatRoom. 
 */
@ThreadSafe
public class ChatRoom {
	private static Logger log = Red5LoggerFactory.getLogger( ChatRoom.class, "bigbluebutton" );
	
	private final String name;
	private final Map<String, IChatRoomListener> listeners;
	ArrayList<ChatObject> messages;
	
	public ChatRoom(String name) {
		this.name = name;
		listeners   = new ConcurrentHashMap<String, IChatRoomListener>();
		this.messages = new ArrayList<ChatObject>();
	}
	
	public String getName() {
		return name;
	}
	
	public void addRoomListener(IChatRoomListener listener) {
		if (! listeners.containsKey(listener.getName())) {
			log.debug("adding room listener");
			listeners.put(listener.getName(), listener);			
		}
	}
	
	public void removeRoomListener(IChatRoomListener listener) {
		log.debug("removing room listener");
		listeners.remove(listener);		
	}
	
	public List<ChatObject> getChatMessages(){
		return messages;
	}
	
	@SuppressWarnings("unchecked")
	public void sendMessage(ChatObject chatobj){
		messages.add(chatobj);
		
		for (Iterator iter = listeners.values().iterator(); iter.hasNext();) {
			log.debug("calling on listener");
			IChatRoomListener listener = (IChatRoomListener) iter.next();
			log.debug("calling newChatMessage on listener " + listener.getName());
			listener.newChatMessage(chatobj);
		}
	}
		
}
