package org.bigbluebutton.conference.service.chat;

import java.util.ArrayList;
import java.util.HashMap;

import org.bigbluebutton.conference.Participant;
import org.bigbluebutton.conference.service.messaging.MessagingConstants;
import org.bigbluebutton.conference.service.messaging.MessagingService;

import redis.clients.jedis.Jedis;

import com.google.gson.Gson;

public class ChatBridge {
	
	private MessagingService messagingService;
	
	public void sendMsg(String meetingID, ChatObject chat){
		ArrayList<Object> updates = new ArrayList<Object>();
		updates.add(meetingID);
		updates.add("msg");
		updates.add(chat.username);
		updates.add(chat.message);
		Gson gson = new Gson();

		messagingService.send(MessagingConstants.BIGBLUEBUTTON_BRIDGE, gson.toJson(updates));
	}
	
	public MessagingService getMessagingService() {
		return messagingService;
	}

	public void setMessagingService(MessagingService messagingService) {
		this.messagingService = messagingService;
	}

	public void storeMsg(String meetingID, ChatObject chatobj) {
		/*Jedis jedis = messagingService.createRedisClient();
		
		HashMap<String,String> map = new HashMap<String, String>();
		map.put("name", chatobj.username);
		map.put("message", chatobj.message);
		jedis.hmset("meeting-"+meetingID+"-messages", map);
		
		messagingService.dropRedisClient(jedis);*/
	}

}
