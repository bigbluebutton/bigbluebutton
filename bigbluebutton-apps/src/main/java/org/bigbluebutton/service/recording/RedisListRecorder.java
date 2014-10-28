package org.bigbluebutton.service.recording;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;

import org.bigbluebutton.conference.service.recorder.RecordEvent;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

import com.google.gson.Gson;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

public class RedisListRecorder {
	private static Logger log = Red5LoggerFactory.getLogger(RedisListRecorder.class, "bigbluebutton");
	private static final int NTHREADS = 1;
	private static final Executor exec = Executors.newFixedThreadPool(NTHREADS);
	private static final Executor runExec = Executors.newFixedThreadPool(NTHREADS);		
	private BlockingQueue<RecordEvent> messages = new LinkedBlockingQueue<RecordEvent>();
	private volatile boolean recordEvents = false;
	
	JedisPool redisPool;
	
	public void start() {
		recordEvents = true;
		Runnable sender = new Runnable() {
			public void run() {
				while (recordEvents) {
					RecordEvent message;
					try {
						message = messages.take();
						recordEvent(message);	
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
		recordEvents = false;
	}	

	private void recordEvent(final RecordEvent message) {
		Runnable task = new Runnable() {
			public void run() {
				Jedis jedis = redisPool.getResource();
				try {
		      String key = "bbb:recording:" + message.getMeetingID();
		      Gson gson= new Gson(); 		
					jedis.rpush(key, gson.toJson(message.toMap()));
				} finally {
					redisPool.returnResource(jedis);
				}				
			}
		};
		runExec.execute(task);
  }
	
	public void record(RecordEvent message) {		
		messages.offer(message);					
	}
	
	public JedisPool getRedisPool() {
		return redisPool;
	}

	public void setRedisPool(JedisPool redisPool) {
		this.redisPool = redisPool;
	}
}
