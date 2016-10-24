package org.bigbluebutton.api.messaging;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.apache.commons.pool2.impl.GenericObjectPoolConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.Protocol;

public class RedisStorageService {
	private static Logger log = LoggerFactory.getLogger(RedisStorageService.class);
	
	private JedisPool redisPool;
	private String host;
	private int port;
	
	public void stop() {

	}
	
	public void start() {
		// Set the name of this client to be able to distinguish when doing
		// CLIENT LIST on redis-cli
		redisPool = new JedisPool(new GenericObjectPoolConfig(), host, port, Protocol.DEFAULT_TIMEOUT, null,
		        Protocol.DEFAULT_DATABASE, "BbbRed5AppsPub");
	}
	
    public void recordMeetingInfo(String meetingId, Map<String, String> info,
            Map<String, String> breakoutInfo) {
        Jedis jedis = redisPool.getResource();
        try {
            for (String key : info.keySet()) {
                log.debug("Storing metadata {} = {}", key, info.get(key));
            }

            log.debug("Saving metadata in {}", meetingId);
            jedis.hmset("meeting:info:" + meetingId, info);

            for (String breakoutKey : breakoutInfo.keySet()) {
                log.debug("Storing breakout metadata {} = {}", breakoutKey,
                        breakoutInfo.get(breakoutKey));
            }

            log.debug("Saving breakout metadata in {}", meetingId);
            jedis.hmset("meeting:breakout:" + meetingId, breakoutInfo);
        } catch (Exception e) {
            log.warn("Cannot record the info meeting:" + meetingId, e);
        } finally {
            jedis.close();
        }
    }
	
	public void removeMeeting(String meetingId){
		Jedis jedis = redisPool.getResource();
		try {
			jedis.del("meeting-" + meetingId);
			jedis.srem("meetings", meetingId);
		} finally {
			jedis.close();
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
			jedis.close();
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
			jedis.close();
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
			jedis.close();
		}

		return sid; 	
	}
	
	public void setHost(String host){
		this.host = host;
	}
	
	public void setPort(int port) {
		this.port = port;
	}
}
