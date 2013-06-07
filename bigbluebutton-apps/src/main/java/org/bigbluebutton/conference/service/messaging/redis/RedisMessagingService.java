/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/
package org.bigbluebutton.conference.service.messaging.redis;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;

import org.bigbluebutton.conference.service.messaging.MessagingConstants;
import org.bigbluebutton.conference.service.messaging.MessagingService;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPubSub;

public class RedisMessagingService implements MessagingService {
	private static Logger log = Red5LoggerFactory.getLogger(RedisMessagingService.class, "bigbluebutton");
	
	private JedisPool redisPool;
	
	// Receives the messages from Redis
	private final Executor msgReceiverExec = Executors.newSingleThreadExecutor();
	// Publish messages to Redis 
	private final Executor msgSenderExec = Executors.newSingleThreadExecutor();
	private BlockingQueue<MessageToSend> messagesToSend = new LinkedBlockingQueue<MessageToSend>();
	private BlockingQueue<ReceivedMessage> receivedMessages = new LinkedBlockingQueue<ReceivedMessage>();
	
	// Forwards received messages to Redis
	private final Executor msgProcessorExec = Executors.newSingleThreadExecutor();
	
	private volatile boolean receiveMessages;
		
	private PubSubMessageReceiver listener;
	
	public void start() {
		startMessageReceiver();
		startMessageProcessor();
		startMessageSender();
	}

	private void startMessageReceiver() {
		log.debug("Starting message receiver...");		
		final Jedis jedis = redisPool.getResource();
		try {
			receiveMessages = true;
			Runnable pubsubListener = new Runnable() {
			    public void run() {
			    	if (receiveMessages) {
			    		jedis.psubscribe(new PubSubListener(), MessagingConstants.BIGBLUEBUTTON_PATTERN); 
			    	}			    	      			
			    }
			};
			msgReceiverExec.execute(pubsubListener);
		} catch (Exception e) {
			log.error("Error subscribing to channels: " + e.getMessage());
		}		
	}
	
	private void startMessageProcessor() {
		log.debug("Starting message processor...");		
		try {
			Runnable messageProcessor = new Runnable() {
			    public void run() {
			    	while (receiveMessages) {
			    		try {
							ReceivedMessage msg = receivedMessages.take();
							if (listener != null) listener.notifyListeners(msg.getPattern(), msg.getChannel(), msg.getMessage());
						} catch (InterruptedException e) {
							// TODO Auto-generated catch block
							e.printStackTrace();
						}
			    		
			    	}   			
			    }
			};
			msgProcessorExec.execute(messageProcessor);
		} catch (Exception e) {
			log.error("Error subscribing to channels: " + e.getMessage());
		}			
	}
	
	private void startMessageSender() {
		log.debug("Starting message sender...");		
		final Jedis jedis = redisPool.getResource();
		try {
			Runnable messageSender = new Runnable() {
			    public void run() {
			    	     			
			    }
			};
			msgSenderExec.execute(messageSender);
		} catch (Exception e) {
			log.error("Error subscribing to channels: " + e.getMessage());
		}			
	}
	
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
		} finally {
			redisPool.returnResource(jedis);
		}
	}
	
	public void setRedisPool(JedisPool redisPool){
		this.redisPool = redisPool;
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
			ReceivedMessage rm = new ReceivedMessage(pattern, channel, message);
			receivedMessages.add(rm);
			
			
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
