package org.bigbluebutton.conference.service.messaging;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

import org.bigbluebutton.conference.Participant;
import org.bigbluebutton.conference.service.chat.ChatApplication;
import org.bigbluebutton.conference.service.chat.ChatObject;
import org.bigbluebutton.conference.service.participants.ParticipantsApplication;
import org.bigbluebutton.conference.service.presentation.PresentationApplication;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.Red5;
import org.red5.server.api.scope.IScope;
import org.slf4j.Logger;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.reflect.TypeToken;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPubSub;

public class RedisMessagingService implements MessagingService{

	private static Logger log = Red5LoggerFactory.getLogger(RedisMessagingService.class, "bigbluebutton");
	
	private JedisPool redisPool;
	private final Executor exec = Executors.newSingleThreadExecutor();
	private Runnable pubsubListener;
	
	private final Set<MessageListener> listeners = new HashSet<MessageListener>();
	
	private ParticipantsApplication participantsApplication;
	private ChatApplication chatApplication;
	private PresentationApplication presentationApplication;

	public RedisMessagingService(){
		
	}
	
	@Override
	public void start() {
		log.debug("Starting redis pubsub...");		
		final Jedis jedis = redisPool.getResource();
		try {
			pubsubListener = new Runnable() {
			    public void run() {
			    	//jedis.psubscribe(new PubSubListener(), MessagingConstants.BIGBLUEBUTTON_PATTERN);
			    	jedis.psubscribe(new PubSubListener(), "*");
			    }
			};
			exec.execute(pubsubListener);
		} catch (Exception e) {
			log.error("Error subscribing to channels: " + e.getMessage());
		}
	}

	@Override
	public void stop() {
		try {
			redisPool.destroy();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	@Override
	public void send(String channel, String message) {
		Jedis jedis = redisPool.getResource();
		try {
			jedis.publish(channel, message);
		} catch(Exception e){
			log.warn("Cannot publish the message to redis", e);
		}finally{
			redisPool.returnResource(jedis);
		}
	}

	@Override
	public void addListener(MessageListener listener) {
		listeners.add(listener);
	}

	@Override
	public void removeListener(MessageListener listener) {
		listeners.remove(listener);
	}
	
	public void setRedisPool(JedisPool redisPool){
		this.redisPool=redisPool;
	}
	
	public Jedis createRedisClient(){
		return redisPool.getResource();
	}
	public void dropRedisClient(Jedis jedis){
		redisPool.returnResource(jedis);
	}
	public void setParticipantsApplication(ParticipantsApplication pa){
		this.participantsApplication = pa;
	}
	public void setChatApplication(ChatApplication ca){
		this.chatApplication = ca;
	}
	public void setPresentationApplication(PresentationApplication pa){
		this.presentationApplication = pa;
	}

	private class PubSubListener extends JedisPubSub {
		
		public PubSubListener() {
			super();			
		}

		@Override
		public void onMessage(String channel, String message) {
			// Not used.
		}

		@Override
		public void onPMessage(String pattern, String channel, String message) {
			log.debug("Message Received in channel: " + channel);
			Gson gson = new Gson();
			
			if(channel.equalsIgnoreCase(MessagingConstants.SYSTEM_CHANNEL)){
				HashMap<String,String> map = gson.fromJson(message, new TypeToken<Map<String, String>>() {}.getType());
				String meetingId = map.get("meetingId");
				String messageId = map.get("messageId");
				if(messageId != null){
					if(MessagingConstants.END_MEETING_REQUEST_EVENT.equalsIgnoreCase(messageId)){
						for (MessageListener listener : listeners) {
							listener.endMeetingRequest(meetingId);
						}
					}
				}
			}
			else if(channel.equalsIgnoreCase(MessagingConstants.PRESENTATION_CHANNEL)){
				HashMap<String,String> map = gson.fromJson(message, new TypeToken<Map<String, String>>() {}.getType());
				
				for (MessageListener listener : listeners) {
					listener.presentationUpdates(map);
				}
			}
			else if(channel.equalsIgnoreCase(MessagingConstants.BIGBLUEBUTTON_BRIDGE)){
				JsonParser parser = new JsonParser();
			    //JsonObject array = parser.parse(message).getAsJsonObject();
				JsonArray array = parser.parse(message).getAsJsonArray();
			    String meetingId = gson.fromJson(array.get(0), String.class);
			    String messageName = gson.fromJson(array.get(1), String.class);

			    
			    //JsonObject params = array.getAsJsonObject("params");
				/*if(messageName.equalsIgnoreCase("user list change")){
					//usernames.push({ 'name' : users[i].username, 'id' : users[i].pubID });
					JsonArray remoteParticipants = array.get(2).getAsJsonArray();
					
					//obtener la lista de participantes
					Map<String,Participant> localParticipants = new HashMap<String, Participant>();
					Map<String,Participant> loadedParticipants = participantsApplication.getParticipants(meetingId);
					if(loadedParticipants != null){
						localParticipants.putAll(loadedParticipants);
					}
					
					//checkear q participante esta
					for(int i=0;i<remoteParticipants.size();i++){
						JsonObject obj = remoteParticipants.get(i).getAsJsonObject();
						String nUserId = gson.fromJson(obj.get("id"),String.class);
						boolean found = false;
						
						for(Map.Entry entry: localParticipants.entrySet()){
							String key = entry.getKey().toString();
							if(key.equalsIgnoreCase(nUserId)){
								found = true;
								localParticipants.remove(entry.getKey());
								break;
							}
						}
						
						if(!found){
							String username = gson.fromJson(obj.get("name"),String.class);
							String externalUserID = UUID.randomUUID().toString();
							
							Map<String, Object> status = new HashMap<String, Object>();
							status.put("raiseHand", false);
							status.put("presenter", false);
							status.put("hasStream", false);
							
							participantsApplication.participantJoin(meetingId, Long.parseLong(nUserId), username, "VIEWER", externalUserID, status);
						}
						
					}
					for(Map.Entry entry: localParticipants.entrySet()){
						participantsApplication.participantLeft(meetingId, Long.parseLong(entry.getKey().toString()));
					}
					
				}else*/ if(messageName.equalsIgnoreCase("user join")){
					String nUserId = gson.fromJson(array.get(2), String.class);
					String username = gson.fromJson(array.get(3), String.class);
					String role = gson.fromJson(array.get(4), String.class);
					String externalUserID = UUID.randomUUID().toString();
					
					Map<String, Object> status = new HashMap<String, Object>();
					status.put("raiseHand", false);
					status.put("presenter", false);
					status.put("hasStream", false);
					
					participantsApplication.participantJoin(meetingId, Long.parseLong(nUserId), username, role, externalUserID, status);
				}else if(messageName.equalsIgnoreCase("user leave")){
					String nUserId = gson.fromJson(array.get(2), String.class);
					participantsApplication.participantLeft(meetingId, Long.parseLong(nUserId));
				}else if(messageName.equalsIgnoreCase("msg")){
					String username = gson.fromJson(array.get(2), String.class);
					String chat_message = gson.fromJson(array.get(3), String.class);
					
					Participant p = participantsApplication.getParticipantByUsername(meetingId, username);
					String userid = "0";
					if(p != null){
						userid = p.getInternalUserID().toString();
					}
					
					ChatObject chatobj = new ChatObject(chat_message, username, "0", "00:00", "en", userid);
					
					chatApplication.sendMessage(meetingId, chatobj);
				}else if(messageName.equalsIgnoreCase("setPresenter")){
					String pubID = gson.fromJson(array.get(2), String.class);
					
					Participant p = participantsApplication.getParticipantByUserID(meetingId,Long.parseLong(pubID));
					log.debug("new presenter: " + p.getInternalUserID() + " "+p.getName());

					ArrayList<String> newPresenter = new ArrayList<String>();
					
					newPresenter.add(pubID);
					newPresenter.add(p.getName());
					newPresenter.add(pubID);
					
					//Update participant status of the new presenter
					participantsApplication.setParticipantStatus(meetingId, p.getInternalUserID(), "presenter", true);
					
					ArrayList<String> curPresenter = participantsApplication.getCurrentPresenter(meetingId);
					if(curPresenter != null){
						String curUserID = curPresenter.get(0);
						log.debug("previous presenter: " + curUserID + " "+ curPresenter.get(1));
						if(!curUserID.equalsIgnoreCase(pubID)){
							participantsApplication.setParticipantStatus(meetingId, Long.parseLong(curUserID), "presenter", false);
						}
					}
					
					participantsApplication.assignPresenter(meetingId, newPresenter);

				}else if(messageName.equalsIgnoreCase("mvCur")){
					Double xPercent = gson.fromJson(array.get(2), Double.class);
					Double yPercent = gson.fromJson(array.get(3), Double.class);
					
					if(xPercent == null || yPercent == null)
					{
						xPercent = 0.0;
						yPercent = 0.0;
					}
					
					presentationApplication.sendCursorUpdate(meetingId, xPercent, yPercent);
				}

			}
			
		}

		@Override
		public void onPSubscribe(String pattern, int subscribedChannels) {
			log.debug("Subscribed to the pattern: " + pattern);
		}

		@Override
		public void onPUnsubscribe(String pattern, int subscribedChannels) {
			// Not used.
		}

		@Override
		public void onSubscribe(String channel, int subscribedChannels) {
			// Not used.
		}

		@Override
		public void onUnsubscribe(String channel, int subscribedChannels) {
			// Not used.
		}		
	}
}
