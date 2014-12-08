package org.bigbluebutton.voiceconf.messaging;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

public class MessageSender {
	private static Logger log = Red5LoggerFactory.getLogger(MessageSender.class, "bigbluebutton");
	
	private JedisPool redisPool;
	private volatile boolean sendMessage = false;
	
	private final Executor msgSenderExec = Executors.newSingleThreadExecutor();
	private BlockingQueue<MessageToSend> messages = new LinkedBlockingQueue<MessageToSend>();
	
	public void stop() {
		sendMessage = false;
	}
	
	public void start() {	
		log.info("Redis message publisher starting!");
		try {
			sendMessage = true;
			
			Runnable messageSender = new Runnable() {
			    public void run() {
			    	while (sendMessage) {
				    	try {
							MessageToSend msg = messages.take();
							publish(msg.getChannel(), msg.getMessage());
						} catch (InterruptedException e) {
							log.warn("Failed to get message from queue.");
						}    			    		
			    	}
			    }
			};
			msgSenderExec.execute(messageSender);
		} catch (Exception e) {
			log.error("Error subscribing to channels: " + e.getMessage());
		}			
	}
	
	public void send(String channel, String message) {
		MessageToSend msg = new MessageToSend(channel, message);
		messages.add(msg);
	}
	
	private void publish(String channel, String message) {
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
}
