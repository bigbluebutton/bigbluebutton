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

	public void storeParticipant(String meetingID, long internalUserID, String username) {

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
		
		/* Storing status properties */
		HashMap<String,String> status = new HashMap<String, String>();
		status.put("raiseHand", "false");
		status.put("presenter", "false");
		status.put("hasStream", "false");
		
		jedis.hmset("meeting-"+meetingID+"-user-"+internalUserID +"-status", status);
		
		messagingService.dropRedisClient(jedis);
	}
	
	public void removeParticipant(String meetingID, long internalUserID) {

		Jedis jedis = messagingService.createRedisClient();
		jedis.srem("meeting-"+meetingID+"-users", Long.toString(internalUserID));
		jedis.del("meeting-"+meetingID+"-user-"+internalUserID);
		messagingService.dropRedisClient(jedis);
	}
	
	public void sendParticipantJoin(String meetingID, Long userid, String username, String role){
		ArrayList<Object> updates = new ArrayList<Object>();
		updates.add(meetingID);
		updates.add("user join");
		updates.add(userid);
		updates.add(username);
		updates.add(role);
		
		Gson gson = new Gson();
		messagingService.send(MessagingConstants.BIGBLUEBUTTON_BRIDGE, gson.toJson(updates));
	}
	
	public void sendParticipantLeave(String meetingID, Long userid){
		ArrayList<Object> updates = new ArrayList<Object>();
		updates.add(meetingID);
		updates.add("user leave");
		updates.add(userid);
		
		Gson gson = new Gson();
		messagingService.send(MessagingConstants.BIGBLUEBUTTON_BRIDGE, gson.toJson(updates));
	}
	
	public void sendParticipantsUpdateList(String meetingID){
		ArrayList<Object> updates = new ArrayList<Object>();
		updates.add(meetingID);
		updates.add("user list change");
		
		ArrayList<Participant> arr= new ArrayList<Participant>(loadParticipants(meetingID).values());
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
			
			Map<String,String> status_from_db = jedis.hgetAll("meeting-"+meetingID+"-user-"+userid+"-status");
			
			Map<String, Object> status = new HashMap<String, Object>();
			status.put("raiseHand", Boolean.parseBoolean(status_from_db.get("raiseHand")));
			status.put("presenter", Boolean.parseBoolean(status_from_db.get("presenter")));
			status.put("hasStream", Boolean.parseBoolean(status_from_db.get("hasStream")));
			
			Participant p = new Participant(internalUserID, users.get("username"), "VIEWER", externalUserID, status);
			map.put(internalUserID, p);
		}
		
		messagingService.dropRedisClient(jedis);
		
		return map;
	}
	
	public void assignPresenter(String meetingID, Long userid, Long previousPresenter) {
		
		Jedis jedis = messagingService.createRedisClient();
		jedis.hset("meeting-"+meetingID+"-user-"+userid+"-status", "presenter", "true");
		if(previousPresenter != -1)
			jedis.hset("meeting-"+meetingID+"-user-"+previousPresenter+"-status", "presenter", "false");
		
		HashMap<String,String> params = new HashMap<String, String>();
		params.put("sessionID", "0");
		params.put("publicID",Long.toString(userid));
		jedis.hmset("meeting-"+meetingID+"-presenter",params);
		
		messagingService.dropRedisClient(jedis);
		
		ArrayList<Object> updates = new ArrayList<Object>();
		updates.add(meetingID);
		updates.add("setPresenter");
		updates.add(userid);
		Gson gson = new Gson();
		messagingService.send(MessagingConstants.BIGBLUEBUTTON_BRIDGE, gson.toJson(updates));
	}
	
}
