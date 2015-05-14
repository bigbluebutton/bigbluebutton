package org.bigbluebutton.api.messaging;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

public class RedisStorageService {
	private static Logger log = LoggerFactory.getLogger(RedisStorageService.class);
	
	private JedisPool redisPool;

	public void recordMeetingInfo(String meetingId, Map<String, String> info) {
		Jedis jedis = redisPool.getResource();
		try {
		    for (String key: info.keySet()) {
				   log.debug("Storing metadata {} = {}", key, info.get(key));
				}   

		    log.debug("Saving metadata in {}", meetingId);
			jedis.hmset("meeting:info:" + meetingId, info);
		} catch (Exception e){
			log.warn("Cannot record the info meeting:"+meetingId,e);
		} finally {
			redisPool.returnResource(jedis);
		}		
	}
	
	public void removeMeeting(String meetingId){
		Jedis jedis = redisPool.getResource();
		try {
			jedis.del("meeting-" + meetingId);
			jedis.srem("meetings", meetingId);
		} finally {
			redisPool.returnResource(jedis);
		}
	}
	
	public void setRedisPool(JedisPool redisPool){
		this.redisPool=redisPool;
	}
}
