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
import redis.clients.jedis.JedisException;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPubSub;

public class RedisMessagingService implements MessagingService {
	private static Logger log = LoggerFactory.getLogger(RedisMessagingService.class);
	
	private JedisPool redisPool;
	private String host;
	private int port;
	private final Set<MessageListener> listeners = new HashSet<MessageListener>();

	private final Executor exec = Executors.newSingleThreadExecutor();
	private Runnable pubsubListener;

	public RedisMessagingService(String host, int port) {
		this.host=host;
		this.port=port;
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
		try{
			jedis.hmset("meeting.info:" + meetingId, info);
		}catch(Exception e){
			log.warn("Cannot record the info meeting:"+meetingId,e);
		}finally{
			redisPool.returnResource(jedis);
		}
		
		
	}

	public void recordMeetingMetadata(String meetingId,	Map<String, String> metadata) {
		Jedis jedis=redisPool.getResource();
		try{
			jedis.hmset("meeting:metadata:" + meetingId, metadata);
		}catch(Exception e){
			log.warn("Cannot record the metadata meeting:"+meetingId,e);
		}finally{
			redisPool.returnResource(jedis);
		}
				
	}

	public void endMeeting(String meetingId) {
		log.warn("***Need to implement sending of end meeting request!");
	}

	public void send(String channel, String message) {
		Jedis jedis=redisPool.getResource();
		try{
			jedis.publish(channel, message);
		}catch(Exception e){
			log.warn("Cannot publish the message to redis",e);
		}finally{
			redisPool.returnResource(jedis);
		}
	}

	public void start() {
		log.debug("Starting redis pubsub...");		
		//Currently, the pool gets blocked for publish if a resource subscribe to a channel
		final Jedis jedis = new Jedis(this.host,this.port);
		pubsubListener = new Runnable() {
		    public void run() {
		    	jedis.psubscribe(new PubSubListener(), MessagingConstants.BIGBLUEBUTTON_PATTERN);       			
		    }
		};
		exec.execute(pubsubListener);
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
			
		}

		@Override
		public void onPMessage(String pattern, String channel,
	            String message) {
			log.debug("Message Received in channel: "+channel);
			
			Gson gson=new Gson();
			HashMap<String,String> map=gson.fromJson(message, new TypeToken<Map<String, String>>() {}.getType());
			
			if(channel.equalsIgnoreCase(MessagingConstants.SYSTEM_CHANNEL)){
				String meetingId=map.get("meetingId");
				String state=map.get("state");

				for (MessageListener listener : listeners) {
					if(state.equalsIgnoreCase("started")) {
						listener.meetingStarted(meetingId);
					} else if(state.equalsIgnoreCase("ended")) {
						listener.meetingEnded(meetingId);
					}
				}

			}
			else if(channel.equalsIgnoreCase(MessagingConstants.PARTICIPANTS_CHANNEL)){
				String meetingId=map.get("meetingId");
				String action=map.get("action");
				if(action.equalsIgnoreCase("join")){
					String userid=map.get("userid");
					String fullname=map.get("fullname");
					String role=map.get("role");
					
					for (MessageListener listener : listeners) {
						listener.userJoined(meetingId, userid, fullname, role);
					}
				}
				else if(action.equalsIgnoreCase("status")){
					String userid=map.get("userid");
					String status=map.get("status");
					String value=map.get("value");
					
					for (MessageListener listener : listeners) {
						listener.updatedStatus(meetingId, userid, status, value);
					}
				}
				else if(action.equalsIgnoreCase("left")){
					String userid=map.get("userid");
					
					for (MessageListener listener : listeners) {
						listener.userLeft(meetingId, userid);
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
