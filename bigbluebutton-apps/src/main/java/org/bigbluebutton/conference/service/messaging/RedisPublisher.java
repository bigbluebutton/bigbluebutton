package org.bigbluebutton.conference.service.messaging;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

public class RedisPublisher{
	
	JedisPool redisPool;

	public RedisPublisher(){
		super();
	}
	
	public void publish(String channel, String message){
		Jedis jedis = redisPool.getResource();
		try {
			jedis.publish(channel, message);
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
