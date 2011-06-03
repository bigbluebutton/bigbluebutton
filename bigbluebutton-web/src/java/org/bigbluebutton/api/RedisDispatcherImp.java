package org.bigbluebutton.api;

import java.io.IOException;
import java.net.UnknownHostException;

import org.bigbluebutton.api.domain.DynamicConference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import redis.clients.jedis.Jedis;

public class RedisDispatcherImp implements IRedisDispatcher {
	private static Logger log = LoggerFactory.getLogger(RedisDispatcherImp.class);
	
	@Override
	public void createConferenceRecord(DynamicConference conf, String redisHost, int redisPort) {
		Jedis jedis = new Jedis(redisHost, redisPort);
		try {
			log.debug("Setting metada for " + "meeting:" + conf.getMeetingToken() + ":metadata");
			jedis.connect();
			jedis.hmset("meeting:" + conf.getMeetingToken() + ":metadata", conf.getMetadata());
		} catch (UnknownHostException e) {
			log.error("Cannot connect to " + redisHost + ":" + redisPort);
		} catch (IOException e) {
			log.error("Failed to connect to Redis on " + redisHost + ":" + redisPort);
		}
		
	}
}
