package org.bigbluebutton.api.messaging;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPubSub;

public class RedisMessagingService implements MessagingService {
	private static Logger log = LoggerFactory.getLogger(RedisMessagingService.class);
	
	private JedisPool redisPool;
	private final Set<MessageListener> listeners = new HashSet<MessageListener>();

	private final Executor exec = Executors.newSingleThreadExecutor();
	private Runnable pubsubListener;

	public RedisMessagingService(){
		
	}
	
 	@Override
	public void addListener(MessageListener listener) {
 		listeners.add(listener);
	}
 	
	public void removeListener(MessageListener listener) {
 		listeners.remove(listener);
 	}

	public void recordMeetingInfo(String meetingId, Map<String, String> info) {
		Jedis jedis = redisPool.getResource();
		try {
		    for (String key: info.keySet()) {
				    	log.debug("Storing metadata {} = {}", key, info.get(key));
				}   

		    log.debug("Saving metadata in {}", meetingId);
			jedis.hmset("meeting:info:" + meetingId, info);
		} catch (Exception e){
			log.warn("Cannot record the info meeting:"+meetingId,e);
		} finally {
			redisPool.returnResource(jedis);
		}		
	}

	public void endMeeting(String meetingId) {
		HashMap<String,String> map = new HashMap<String, String>();
		map.put("messageId", MessagingConstants.END_MEETING_REQUEST_EVENT);
		map.put("meetingId", meetingId);
		Gson gson = new Gson();
		send(MessagingConstants.SYSTEM_CHANNEL, gson.toJson(map));
	}

	public void send(String channel, String message) {
		Jedis jedis = redisPool.getResource();
		try {
			jedis.publish(channel, message);
		} catch(Exception e){
			log.warn("Cannot publish the message to redis",e);
		}finally{
			redisPool.returnResource(jedis);
		}
	}

	public void start() {
		log.debug("Starting redis pubsub...");		

		final Jedis jedis = redisPool.getResource();
		try {
			pubsubListener = new Runnable() {
			    public void run() {
			    	jedis.psubscribe(new PubSubListener(), MessagingConstants.BIGBLUEBUTTON_PATTERN);       			
			    }
			};
			exec.execute(pubsubListener);
		} catch (Exception e) {
			log.error("Error in subscribe: " + e.getMessage());
		}
	}

	public void stop() {
		try {
			redisPool.destroy();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	public void setRedisPool(JedisPool redisPool){
		this.redisPool=redisPool;
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
			log.debug("Message: " + message);
			
			Gson gson = new Gson();
			HashMap<String,String> map = gson.fromJson(message, new TypeToken<Map<String, String>>() {}.getType());
			
//			for (String key: map.keySet()) {
//				log.debug("rx: {} = {}", key, map.get(key));
//			}
			
			if(channel.equalsIgnoreCase(MessagingConstants.SYSTEM_CHANNEL)){
				String meetingId = map.get("meetingId");
				String messageId = map.get("messageId");
				log.debug("*** Meeting {} Message {}", meetingId, messageId);
				
				for (MessageListener listener : listeners) {
					if(MessagingConstants.MEETING_STARTED_EVENT.equalsIgnoreCase(messageId)) {
						listener.meetingStarted(meetingId);
					} else if(MessagingConstants.MEETING_ENDED_EVENT.equalsIgnoreCase(messageId)) {
						listener.meetingEnded(meetingId);
					}
				}
			}
			else if(channel.equalsIgnoreCase(MessagingConstants.PARTICIPANTS_CHANNEL)){
				String meetingId = map.get("meetingId");
				String messageId = map.get("messageId");
				if(MessagingConstants.USER_JOINED_EVENT.equalsIgnoreCase(messageId)){
					String internalUserId = map.get("internalUserId");
					String externalUserId = map.get("externalUserId");
					String fullname = map.get("fullname");
					String role = map.get("role");
					
					for (MessageListener listener : listeners) {
						listener.userJoined(meetingId, internalUserId, externalUserId, fullname, role);
					}
				} else if(MessagingConstants.USER_STATUS_CHANGE_EVENT.equalsIgnoreCase(messageId)){
					String internalUserId = map.get("internalUserId");
					String status = map.get("status");
					String value = map.get("value");
					
					for (MessageListener listener : listeners) {
						listener.updatedStatus(meetingId, internalUserId, status, value);
					}
				} else if(MessagingConstants.USER_LEFT_EVENT.equalsIgnoreCase(messageId)){
					String internalUserId = map.get("internalUserId");
					
					for (MessageListener listener : listeners) {
						listener.userLeft(meetingId, internalUserId);
					}
				}
			}
		}

		@Override
		public void onPSubscribe(String pattern, int subscribedChannels) {
			log.debug("Subscribed to the pattern:"+pattern);
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
