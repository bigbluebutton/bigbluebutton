/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.Red5;import org.bigbluebutton.conference.BigBlueButtonSession;
import org.bigbluebutton.conference.Constants;
import org.bigbluebutton.conference.meeting.messaging.red5.BroadcastClientMessage;
import org.bigbluebutton.conference.meeting.messaging.red5.ConnectionInvokerService;
import org.bigbluebutton.conference.meeting.messaging.red5.DirectClientMessage;
import org.bigbluebutton.conference.service.chat.ChatRoomsManager;
import org.bigbluebutton.conference.service.chat.ChatRoom;import org.bigbluebutton.conference.service.chat.IChatRoomListener;


public class ChatApplication {

	private static Logger log = Red5LoggerFactory.getLogger( ChatApplication.class, "bigbluebutton" );	
		
	private ChatRoomsManager roomsManager;
	public ChatHandler handler;
	private ConnectionInvokerService connInvokerService;
	
	public boolean createRoom(String name) {
		roomsManager.addRoom(new ChatRoom(name));
		return true;
	}
	
	public boolean destroyRoom(String name) {
		if (roomsManager.hasRoom(name)) {
			roomsManager.removeRoom(name);
		}
		return true;
	}
	
	public boolean hasRoom(String name) {
		return roomsManager.hasRoom(name);
	}
	
	public boolean addRoomListener(String room, IChatRoomListener listener) {
		if (roomsManager.hasRoom(room)){
			roomsManager.addRoomListener(room, listener);
			return true;
		}
		log.warn("Adding listener to a non-existant room " + room);
		return false;
	}
	
	public void sendPublicChatHistory(String meetingID) {
		List<ChatMessageVO> messages = roomsManager.getChatMessages(meetingID);
		
		List<Map<String, Object>> msgs = new ArrayList<Map<String, Object>>();
		for (ChatMessageVO v : messages) {
			msgs.add(v.toMap());
		}
		
		Map<String, Object> messageToSend = new HashMap<String, Object>();
		messageToSend.put("count", new Integer(msgs.size()));
		messageToSend.put("messages", msgs);
		
		DirectClientMessage m = new DirectClientMessage(getMeetingId(), getBbbSession().getInternalUserID(), "ChatRequestMessageHistoryReply", messageToSend);
		connInvokerService.sendMessage(m);
	}
	
	public void sendPublicMessage(String room, ChatMessageVO chatobj) {
		roomsManager.sendMessage(room, chatobj);
		
		BroadcastClientMessage m = new BroadcastClientMessage(getMeetingId(), "ChatReceivePublicMessageCommand", chatobj.toMap());
		connInvokerService.sendMessage(m);
	}

	public void sendPrivateMessage(ChatMessageVO chatobj) {
		DirectClientMessage m = new DirectClientMessage(getMeetingId(), chatobj.toUserID, "ChatReceivePrivateMessageCommand", chatobj.toMap());
		connInvokerService.sendMessage(m);
		
		DirectClientMessage m2 = new DirectClientMessage(getMeetingId(), chatobj.fromUserID, "ChatReceivePrivateMessageCommand", chatobj.toMap());
		connInvokerService.sendMessage(m2);
	}
	
	public void setRoomsManager(ChatRoomsManager r) {
		log.debug("Setting room manager");
		roomsManager = r;
	}
	
	private String getMeetingId(){
		return Red5.getConnectionLocal().getScope().getName();
	}
	
	private BigBlueButtonSession getBbbSession() {
		return (BigBlueButtonSession) Red5.getConnectionLocal().getAttribute(Constants.SESSION);
	}
	
	public void setConnInvokerService(ConnectionInvokerService connInvokerService) {
		this.connInvokerService = connInvokerService;
	}
}
