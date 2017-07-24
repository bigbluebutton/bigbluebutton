package org.bigbluebutton.voiceconf.messaging;

import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPubSub;

public class MessageReceiver {
	private static Logger log = Red5LoggerFactory.getLogger(MessageReceiver.class, "bigbluebutton");
	
	private ReceivedMessageHandler handler;
	
	private JedisPool redisPool;
	private volatile boolean receiveMessage = false;
	
	private final Executor msgReceiverExec = Executors.newSingleThreadExecutor();

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
			    		jedis.psubscribe(new PubSubListener(), MessagingConstants.TO_AKKA_APPS_CHANNEL);
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
		public void onPMessage(String pattern, String channel, String message) {
			handler.handleMessage(pattern, channel, message);			
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
