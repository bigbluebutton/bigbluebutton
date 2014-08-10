package org.bigbluebutton.api.messaging;

import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPubSub;

public class MessageReceiver {
	private static Logger log = LoggerFactory.getLogger(MessageReceiver.class);
	
	private ReceivedMessageHandler handler;
	
	private JedisPool redisPool;
	private volatile boolean receiveMessage = false;
	
	private final Executor msgReceiverExec = Executors.newSingleThreadExecutor();
	private final Executor runExec = Executors.newSingleThreadExecutor();
	
	public void stop() {
		receiveMessage = false;
	}
	
	public void start() {
		log.info("Ready to receive messages from Redis pubsub.");
		try {
			receiveMessage = true;
			final Jedis jedis = redisPool.getResource();
			
			Runnable messageReceiver = new Runnable() {
			    public void run() {
			    	if (receiveMessage) {
			    		jedis.psubscribe(new PubSubListener(), MessagingConstants.FROM_BBB_APPS_PATTERN); 
			    	}
			    }
			};
			msgReceiverExec.execute(messageReceiver);
		} catch (Exception e) {
			log.error("Error subscribing to channels: " + e.getMessage());
		}			
	}
	
	public void setRedisPool(JedisPool redisPool){
		this.redisPool = redisPool;
	}
	
	public void setMessageHandler(ReceivedMessageHandler handler) {
		this.handler = handler;
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
		public void onPMessage(final String pattern, final String channel, final String message) {
			Runnable task = new Runnable() {
		    public void run() {
		    	handler.handleMessage(pattern, channel, message);	
		    }
			};
			
			runExec.execute(task);		
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

