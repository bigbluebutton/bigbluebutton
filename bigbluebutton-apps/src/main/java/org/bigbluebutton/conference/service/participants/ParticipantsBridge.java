package org.bigbluebutton.conference.service.participants;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.bigbluebutton.conference.Participant;
import org.bigbluebutton.conference.service.messaging.MessagingConstants;
import org.bigbluebutton.conference.service.messaging.MessagingService;

import com.google.gson.Gson;

import redis.clients.jedis.Jedis;

public class ParticipantsBridge {
	
	private MessagingService messagingService;
	
	public ParticipantsBridge(){
		
	}

	public void participantJoined(String meetingID, long internalUserID, String username) {

		//temporary solution for integrate with the html5 client
		Jedis jedis = messagingService.createRedisClient();
		jedis.sadd("meeting-"+meetingID+"-users", Long.toString(internalUserID));
		//"username", username,        "meetingID", meetingID, "refreshing", false, "dupSess", false, "sockets", 0, 'pubID', publicID
		HashMap<String,String> temp_user = new HashMap<String, String>();
		temp_user.put("username", username);
		temp_user.put("meetingID", meetingID);
		temp_user.put("refreshing", "false");
		temp_user.put("dupSess", "false");
		temp_user.put("sockets", "0");
		temp_user.put("pubID", Long.toString(internalUserID));
		
		jedis.hmset("meeting-"+meetingID+"-user-"+internalUserID, temp_user);
		messagingService.dropRedisClient(jedis);
	}
	
	public void participantLeft(String meetingID, long internalUserID) {

		Jedis jedis = messagingService.createRedisClient();
		jedis.srem("meeting-"+meetingID+"-users", Long.toString(internalUserID));
		jedis.del("meeting-"+meetingID+"-user:"+internalUserID);
		messagingService.dropRedisClient(jedis);
	}
	
	public void sendParticipantsUpdateList(String meetingID, Map<Long,Participant> participants){
		ArrayList<Object> updates = new ArrayList<Object>();
		updates.add(meetingID);
		updates.add("user list change");
		
		ArrayList<Participant> arr= new ArrayList<Participant>(participants.values());
		ArrayList<Object> all_participants = new ArrayList<Object>();
		for(int i=0; i<arr.size(); i++){
			Participant p = arr.get(i);
			HashMap<String,String> id_name = new HashMap<String, String>();
			id_name.put("name", p.getName());
			id_name.put("id", p.getInternalUserID().toString());
			all_participants.add(id_name);
		}
		updates.add(all_participants);

		Gson gson = new Gson();

		messagingService.send(MessagingConstants.BIGBLUEBUTTON_BRIDGE, gson.toJson(updates));
	}
	
	public MessagingService getMessagingService() {
		return messagingService;
	}

	public void setMessagingService(MessagingService messagingService) {
		this.messagingService = messagingService;
	}

	public Map<Long,Participant> loadParticipants(
			String meetingID) {
		HashMap<Long,Participant> map = new HashMap<Long, Participant>();
		
		Jedis jedis = messagingService.createRedisClient();
		Set<String> userids = jedis.smembers("meeting-"+meetingID+"-users");
		
		for(String userid:userids){
			Map<String,String> users = jedis.hgetAll("meeting-"+meetingID+"-user-"+userid);
			
			long internalUserID = Long.parseLong(users.get("pubID"));
			String externalUserID = UUID.randomUUID().toString();
			Map<String, Object> status = new HashMap<String, Object>();
			status.put("raiseHand", false);
			status.put("presenter", false);
			status.put("hasStream", false);
			
			Participant p = new Participant(internalUserID, users.get("username"), "VIEWER", externalUserID, status);
			map.put(internalUserID, p);
		}
		
		messagingService.dropRedisClient(jedis);
		
		return map;
	}
	
}
