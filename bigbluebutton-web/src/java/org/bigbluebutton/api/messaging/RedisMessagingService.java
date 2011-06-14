package org.bigbluebutton.api.messaging;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.exceptions.JedisException;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPubSub;

public class RedisMessagingService extends MessagingService {
	private static Logger log = LoggerFactory.getLogger(RedisMessagingService.class);

	private JedisPool redisPool;
	private final Set<MessageListener> listeners = new HashSet<MessageListener>();

	private final Executor exec = Executors.newSingleThreadExecutor();
	private Runnable pubsubListener;

	public RedisMessagingService() {

	}
	
 	@Override
	public void addListener(MessageListener listener) {
 		listeners.add(listener);
	}
 	
 	@Override
	public void removeListener(MessageListener listener) {
 		listeners.remove(listener);
 	}

	@Override
	public void recordMeetingInfo(String meetingId, Map<String, String> info) {
		Jedis jedis=redisPool.getResource();
		try{
			jedis.hmset("meeting.info:" + meetingId, info);
		}catch(JedisException e){
			log.error("Cannot record the info meeting: %s",meetingId);
		}finally{
			redisPool.returnResource(jedis);
		}
		
		
	}

	@Override
	public void recordMeetingMetadata(String meetingId,	Map<String, String> metadata) {
		Jedis jedis=redisPool.getResource();
		try{
			jedis.hmset("meeting:metadata:" + meetingId, metadata);
		}catch(JedisException e){
			log.error("Cannot record the metadata meeting: %s",meetingId);
		}finally{
			redisPool.returnResource(jedis);
		}
				
	}

	@Override
	public void endMeeting(String meetingId) {
		log.warn("***Need to implement sending of end meeting request!");
	}

	@Override
	public void send(String channel, String message) {
		Jedis jedis=redisPool.getResource();
		try{
			jedis.publish(channel, message);
		}catch(JedisException e){
			log.error("Cannot publish the message %s to redis",message);
		}finally{
			redisPool.returnResource(jedis);
		}
	}

	@Override
	public void start() {
		log.debug("Starting redis pubsub...");
		//final Jedis jedis=redisPool.getResource();
		final Jedis jedis= new Jedis("localhost");
		try {
			 pubsubListener = new Runnable() {
		    	public void run() {
		    		jedis.psubscribe(new PubSubListener(), MEETING_EVENTS);       			
		    	}
			 };
		    exec.execute(pubsubListener);

		} catch (JedisException e) {
			log.error("Cannot subscribe to the redis channel");
		}finally{
			//redisPool.returnResource(jedis);
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
	
	public void setRedisPool(JedisPool redisPool){
		this.redisPool=redisPool;
	}

	
	/*
	 * Pubsub channels:
	 * 		- bigbluebutton:conference:status --> value: "<confid>:started" or "<confid>:ended"
	 * 		- bigbluebutton:conference:join   --> value: "<confid>:<userid>:<fullname>:<role>"
	 * 		- bigbluebutton:conference:remove --> value: "<confid>:<userid>"
	 * 
	 * 
	 **/
	
	private class PubSubListener extends JedisPubSub {
		private final String CHANNEL_STATE="bigbluebutton:meeting:state";
		private final String CHANNEL_PARTICIPANTS="bigbluebutton:meeting:participants";

		private final String COLON=":";
		
		public PubSubListener() {
			super();			
		}

		@Override
		public void onMessage(String channel, String message) {
			
		}

		@Override
		public void onPMessage(String pattern, String channel,
	            String message) {
			
			System.out.println("redis message received. pattern:" + pattern + " channel:" + channel + " message:" + message);
			
			String[] args=message.split(COLON);

			if(channel.equalsIgnoreCase(CHANNEL_STATE)){
				//params extract
				String meetingId=args[0];
				String status=args[1];

				for (MessageListener listener : listeners) {
					if(status.equalsIgnoreCase("started")) {
						listener.meetingStarted(meetingId);
					} else if(status.equalsIgnoreCase("ended")) {
						listener.meetingStarted(meetingId);
					}
				}

			}
			else if(channel.equalsIgnoreCase(CHANNEL_PARTICIPANTS)){
				//params extract
				String meetingId=args[0];
				String action=args[1];

				if(action.equalsIgnoreCase("join")){
					String userid=args[2];
					String fullname=args[3];
					String role=args[4];
					
					for (MessageListener listener : listeners) {
						listener.userJoined(meetingId, userid, fullname, role);
					}
				}
				else if(action.equalsIgnoreCase("status")){
					String userid=args[2];
					String status=args[3];
					String value=args[4];
					
					for (MessageListener listener : listeners) {
						listener.updatedStatus(meetingId, userid, status, value);
					}
				}
				else if(action.equalsIgnoreCase("left")){
					String userid=args[2];
					
					for (MessageListener listener : listeners) {
						listener.userLeft(meetingId, userid);
					}
				}

			}
			
		}

		@Override
		public void onPSubscribe(String pattern, int subscribedChannels) {
			// TODO Auto-generated method stub

		}

		@Override
		public void onPUnsubscribe(String pattern, int subscribedChannels) {
			// TODO Auto-generated method stub

		}

		@Override
		public void onSubscribe(String channel, int subscribedChannels) {
			// TODO Auto-generated method stub

		}

		@Override
		public void onUnsubscribe(String channel, int subscribedChannels) {
			// TODO Auto-generated method stub

		}
		
	}

}
