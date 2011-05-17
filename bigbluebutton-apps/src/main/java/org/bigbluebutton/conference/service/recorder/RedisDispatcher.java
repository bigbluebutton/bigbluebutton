package org.bigbluebutton.conference.service.recorder;

import org.apache.commons.pool.impl.GenericObjectPool.Config;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisException;
import redis.clients.jedis.JedisPool;

public class RedisDispatcher implements Recorder {
	private static final String COLON=":";
	JedisPool redisPool;
	
	public RedisDispatcher(){
		super();
	}
	
	@Override
	public void record(String session, RecordEvent message) {
		
		Jedis jedis = redisPool.getResource();
		try {
			Long msgid = jedis.incr("global:nextRecordedMsgId");
			jedis.hmset("recording" + COLON + session + COLON + msgid, message.toMap());
			jedis.rpush("meeting" + COLON + session + COLON + "recordings", msgid.toString());
		} finally {
			redisPool.returnResource(jedis);
		}
		
		//pool.destroy();					
	}
/*	
	@Override
	public void record(String session, RecordEvent message) {
		boolean tryAgain = true;
		int howMany = 10;
		while (tryAgain) {
			Jedis jedis = jpool.getResource();
			try {
				Long msgid = jedis.incr("global:nextRecordedMsgId");
				jedis.hmset("recording" + COLON + session + COLON + msgid, message.toMap());
				jedis.rpush("meeting" + COLON + session + COLON + "recordings", msgid.toString());
				jpool.returnResource(jedis);				
			} catch(JedisException e) {
				System.out.println("Failed to get redis connection...trying again...");
				if (howMany < 0) {
					tryAgain = false;
				} else {
					howMany--;
					jpool.returnBrokenResource(jedis);
				}
			}
			
		}
	}
*/

	public JedisPool getRedisPool() {
		return redisPool;
	}

	public void setRedisPool(JedisPool redisPool) {
		this.redisPool = redisPool;
	}
	

}
