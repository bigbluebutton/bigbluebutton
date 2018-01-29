package org.bigbluebutton.voiceconf.messaging;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.Protocol;
import org.apache.commons.pool2.impl.GenericObjectPoolConfig;

public class MessageSender {
	private static Logger log = Red5LoggerFactory.getLogger(MessageSender.class, "bigbluebutton");

	private JedisPool redisPool;
	private volatile boolean sendMessage = false;

	private final Executor msgSenderExec = Executors.newSingleThreadExecutor();
	private final Executor runExec = Executors.newSingleThreadExecutor();
	private BlockingQueue<MessageToSend> messages = new LinkedBlockingQueue<MessageToSend>();
	private String host;
	private int port;

	public void stop() {
		sendMessage = false;
		redisPool.destroy();
	}

	public void start() {

		GenericObjectPoolConfig config = new GenericObjectPoolConfig();
		config.setMaxTotal(32);
		config.setMaxIdle(8);
		config.setMinIdle(1);
		config.setTestOnBorrow(true);
		config.setTestOnReturn(true);
		config.setTestWhileIdle(true);
		config.setNumTestsPerEvictionRun(12);
		config.setMaxWaitMillis(5000);
		config.setTimeBetweenEvictionRunsMillis(60000);
		config.setBlockWhenExhausted(true);

		// Set the name of this client to be able to distinguish when doing
		// CLIENT LIST on redis-cli
		redisPool = new JedisPool(config, host, port, Protocol.DEFAULT_TIMEOUT, null,
				Protocol.DEFAULT_DATABASE, "BbbRed5VoicePub");

		log.info("Redis org.bigbluebutton.red5.pubsub.message publisher starting!");
		try {
			sendMessage = true;

			Runnable messageSender = new Runnable() {
				public void run() {
					while (sendMessage) {
						try {
							MessageToSend msg = messages.take();
							publish(msg.getChannel(), msg.getMessage());
						} catch (InterruptedException e) {
							log.warn("Failed to get org.bigbluebutton.red5.pubsub.message from queue.");
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

	private void publish(final String channel, final String message) {
		Runnable task = new Runnable() {
			public void run() {
				Jedis jedis = redisPool.getResource();
				try {
					jedis.publish(channel, message);
				} catch(Exception e){
					log.warn("Cannot publish the org.bigbluebutton.red5.pubsub.message to redis", e);
				} finally {
					redisPool.returnResource(jedis);
				}
			}
		};

		runExec.execute(task);
	}


	public void setHost(String host){
		this.host = host;
	}

	public void setPort(int port) {
		this.port = port;
	}
}
