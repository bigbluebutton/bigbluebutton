package org.bigbluebutton.red5.pubsub.redis;

import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

import org.bigbluebutton.common.messages.MessagingConstants;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPubSub;
import redis.clients.jedis.exceptions.JedisConnectionException;

public class MessageReceiver {

	private ReceivedMessageHandler handler;
	
	private Jedis jedis;
	private volatile boolean receiveMessage = false;
	
	private final Executor msgReceiverExec = Executors.newSingleThreadExecutor();

	private String host;
	private int port;
	
	public void stop() {
		receiveMessage = false;
	}
	
	public void start() {
		//log.info("Ready to receive messages from Redis pubsub.");
		try {
			receiveMessage = true;
			jedis = new Jedis(host, port);
			// Set the name of this client to be able to distinguish when doing
			// CLIENT LIST on redis-cli
			jedis.clientSetname("BbbRed5AppsSub");
			
			Runnable messageReceiver = new Runnable() {
			    public void run() {
			    	if (receiveMessage) {
			    		try {
			    			jedis.psubscribe(new PubSubListener(),
				    				MessagingConstants.FROM_BBB_APPS_PATTERN);
			    		} catch(JedisConnectionException ex) {
			    			//log.warn("Exception on Jedis connection. Resubscribing to pubsub.");
			    			start();
			    		}
			    		 
			    	}
			    }
			};
			msgReceiverExec.execute(messageReceiver);
		} catch (Exception e) {
			//log.error("Error subscribing to channels: " + e.getMessage());
		}			
	}
	
	public void setHost(String host){
		this.host = host;
	}
	
	public void setPort(int port) {
		this.port = port;
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
			//log.debug("Subscribed to the pattern: " + pattern);
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
