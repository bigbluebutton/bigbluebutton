package org.bigbluebutton.api.messaging;

import java.io.IOException;
import java.net.UnknownHostException;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPubSub;

public class RedisMessagingService implements MessagingService {
	private static Logger log = LoggerFactory.getLogger(RedisMessagingService.class);
	
	private Jedis jedis;
	private final String host;
	private final int port;
	private final Set<MessageListener> listeners = new HashSet<MessageListener>();

	private final Executor exec = Executors.newSingleThreadExecutor();
	private Runnable pubsubListener;

	public RedisMessagingService(String host, int port) {
		this.host = host;
		this.port = port;
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
		jedis.hmset("meeting.info:" + meetingId, info);
	}

	@Override
	public void recordMeetingMetadata(String meetingId,	Map<String, String> metadata) {
		jedis.hmset("meeting:metadata:" + meetingId, metadata);		
	}

	@Override
	public void endMeeting(String meetingId) {
		log.warn("***Need to implement sending of end meeting request!");
	}

	@Override
	public void send(String channel, String message) {
		jedis.publish(channel, message);
	}

	@Override
	public void start() {
		jedis = new Jedis(host, port, 0);
		try {
			jedis.connect();
			 pubsubListener = new Runnable() {
		    	public void run() {
		    		jedis.psubscribe(new PubSubListener(), "bigbluebutton:conference:*");       			
		    	}
			 };
		    exec.execute(pubsubListener);

		} catch (UnknownHostException e) {
			log.error("Unknown host[" + host + "]");
		} catch (IOException e) {
			log.error("Cannot connect to [" + host + ":" + port + "]");
		}
	}

	@Override
	public void stop() {
		try {
			jedis.disconnect();
		} catch (IOException e) {
			e.printStackTrace();
		}
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
		private final String PATTERN_CONFERENCE="bigbluebutton:conference:*";		
		private final String CHANNEL_STATUS="bigbluebutton:conference:status";
		private final String CHANNEL_JOIN="bigbluebutton:conference:join";
		private final String CHANNEL_LEAVE="bigbluebutton:conference:remove";
		
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
			
			if(pattern.equalsIgnoreCase(PATTERN_CONFERENCE)){
				String[] args = message.split(COLON);
				
				if(channel.equalsIgnoreCase(CHANNEL_STATUS)){
					//params extract
					String meetingId = args[0];
					String status = args[1];
					
					for (MessageListener listener : listeners) {
						if(status.equalsIgnoreCase("started")) {
							listener.meetingStarted(meetingId);
						} else if(status.equalsIgnoreCase("ended")) {
							listener.meetingStarted(meetingId);
						}
					}
				} else if(channel.equalsIgnoreCase(CHANNEL_JOIN)){
					//params extract
					String meetingId = args[0];
					String userId = args[1];
					String name = args[2];
					String role = args[3];
				
					for (MessageListener listener : listeners) {
						listener.userJoined(meetingId, userId, name, role);
					}
				} else if(channel.equalsIgnoreCase(CHANNEL_LEAVE)){
					String meetingId = args[0];
					String userId = args[1];
					
					for (MessageListener listener : listeners) {
						listener.userLeft(meetingId, userId);
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
