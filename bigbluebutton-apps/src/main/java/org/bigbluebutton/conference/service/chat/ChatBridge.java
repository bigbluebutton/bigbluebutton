package org.bigbluebutton.conference.service.chat;

import java.util.ArrayList;
import java.util.HashMap;

import org.bigbluebutton.conference.service.messaging.MessagingConstants;
import org.bigbluebutton.conference.service.messaging.MessagingService;

import redis.clients.jedis.Jedis;

import com.google.gson.Gson;

public class ChatBridge {
	
	private MessagingService messagingService;
	
	public void sendMsg(String meetingID, ChatMessageVO chat){
		ArrayList<Object> updates = new ArrayList<Object>();
		updates.add(meetingID);
		updates.add("msg");
		updates.add(chat.fromUsername);
		updates.add(chat.message);
		updates.add(chat.fromUserID);
		Gson gson = new Gson();

		messagingService.send(MessagingConstants.BIGBLUEBUTTON_BRIDGE, gson.toJson(updates));
	}
	
	public MessagingService getMessagingService() {
		return messagingService;
	}

	public void setMessagingService(MessagingService messagingService) {
		this.messagingService = messagingService;
	}

	public void storeMsg(String meetingID, ChatMessageVO chatobj) {
		Jedis jedis = messagingService.createRedisClient();
		
		HashMap<String,String> map = new HashMap<String, String>();
		long messageid = System.currentTimeMillis();
		
		map.put("message", chatobj.message);
		map.put("username", chatobj.fromUsername);
		map.put("userID", chatobj.fromUserID);
		jedis.hmset("meeting-"+meetingID+"-message-"+messageid, map);
		jedis.rpush("meeting-"+meetingID+"-messages", Long.toString(messageid));
		
		messagingService.dropRedisClient(jedis);
	}

}
