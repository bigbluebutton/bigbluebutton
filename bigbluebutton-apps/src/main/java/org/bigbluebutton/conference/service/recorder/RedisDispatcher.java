package org.bigbluebutton.conference.service.recorder;

import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

public class RedisDispatcher implements Recorder {
	private static Logger log = Red5LoggerFactory.getLogger(Recorder.class, "bigbluebutton");
	private static final String COLON=":";
	JedisPool redisPool;
	
	public RedisDispatcher(){
		super();
		log.debug("setting redis dispatcher");
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
	}
	
	public JedisPool getRedisPool() {
		return redisPool;
	}

	public void setRedisPool(JedisPool redisPool) {
		this.redisPool = redisPool;
	}
	

}
