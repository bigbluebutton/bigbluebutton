package org.bigbluebutton.core.api;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

public class RedisLpushDispatcher implements IDispatcher {
	private static final int NTHREADS = 1;
	private static final Executor exec = Executors.newFixedThreadPool(NTHREADS);
	
	private static final String BBBMESSAGES = "bbb:meeting:messages";
	
	private BlockingQueue<String> messages;
	private volatile boolean dispatchEvents = false;
	
	private JedisPool redisPool;
	
	public RedisLpushDispatcher() {
		messages = new LinkedBlockingQueue<String>();
	}
	
	@Override
	public void dispatch(String jsonMessage) {
		messages.offer(jsonMessage);
	}

	private void saveMessage(String msg) {
		Jedis jedis = redisPool.getResource();
		try {
			jedis.lpush(BBBMESSAGES, msg);
		} finally {
			redisPool.returnResource(jedis);
		}	
	}
	
	public void start() {
		dispatchEvents = true;
		Runnable sender = new Runnable() {
			public void run() {
				while (dispatchEvents) {
					String message;
					try {
						message = messages.take();
						saveMessage(message);	
					} catch (InterruptedException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
									
				}
			}
		};
		exec.execute(sender);		
	}
	
	public void stop() {
		dispatchEvents = false;
	}
	
	public void setRedisPool(JedisPool redisPool) {
		this.redisPool = redisPool;
	}
}
