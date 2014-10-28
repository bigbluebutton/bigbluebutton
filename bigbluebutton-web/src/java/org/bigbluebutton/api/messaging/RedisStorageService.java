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
	
	public List<Map<String,String>> listSubscriptions(String meetingId){
		List<Map<String,String>> list = new ArrayList<Map<String,String>>();
		Jedis jedis = redisPool.getResource();
		try {
			List<String> sids = jedis.lrange("meeting:" + meetingId + ":subscriptions", 0 , -1);
			for(int i=0; i<sids.size(); i++){
				Map<String,String> props = jedis.hgetAll("meeting:" + meetingId + ":subscription:" + sids.get(i));
				list.add(props);	
			}
				
		} catch (Exception e){
			log.warn("Cannot list subscriptions:" + meetingId, e);
		} finally {
			redisPool.returnResource(jedis);
		}

		return list;	
	}	
	
	public boolean removeSubscription(String meetingId, String subscriptionId){
		boolean unsubscribed = true;
		Jedis jedis = redisPool.getResource();
		try {
			jedis.hset("meeting:" + meetingId + ":subscription:" + subscriptionId, "active", "false");	
		} catch (Exception e){
			log.warn("Cannot rmove subscription:" + meetingId, e);
			unsubscribed = false;
		} finally {
			redisPool.returnResource(jedis);
		}

		return unsubscribed; 	
	}
	
	public String storeSubscription(String meetingId, String externalMeetingID, String callbackURL){
		String sid = "";
		Jedis jedis = redisPool.getResource();
		try {
			sid = Long.toString(jedis.incr("meeting:" + meetingId + ":nextSubscription"));

			HashMap<String,String> props = new HashMap<String,String>();
			props.put("subscriptionID", sid);
			props.put("meetingId", meetingId);
			props.put("externalMeetingID", externalMeetingID);
			props.put("callbackURL", callbackURL);
			props.put("active", "true");

			jedis.hmset("meeting:" + meetingId + ":subscription:" + sid, props);
			jedis.rpush("meeting:" + meetingId + ":subscriptions", sid);
			
		} catch (Exception e){
			log.warn("Cannot store subscription:" + meetingId, e);
		} finally {
			redisPool.returnResource(jedis);
		}

		return sid; 	
	}
	
	public void setRedisPool(JedisPool redisPool){
		this.redisPool=redisPool;
	}
}
