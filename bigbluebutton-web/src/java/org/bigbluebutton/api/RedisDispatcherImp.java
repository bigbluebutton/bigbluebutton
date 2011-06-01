package org.bigbluebutton.api;

import org.bigbluebutton.api.domain.DynamicConference;
import redis.clients.jedis.Jedis;
import java.util.*;

public class RedisDispatcherImp implements IRedisDispatcher {

//	private String redisHost;
//	private int redisPort;
	private final static String COLON = ":";
	
	@Override
	public void createConferenceRecord(DynamicConference conf, String redisHost, int redisPort) {
		System.out.println("In createConferenceRecord " + redisHost + ":" + redisPort);
		Jedis jedis = new Jedis(redisHost, redisPort);
		
		Map<String, String> confMap = new HashMap<String,String>();
		System.out.println("Storing " + conf.getName());
		confMap.put("name", conf.getName());
		
		jedis.hmset("meeting:" + conf.getMeetingToken() + ":info", confMap);
		jedis.hmset("meeting:" + conf.getMeetingToken() + ":metadata", conf.getMetadata());
	}

//	public void setRedisHost(String redisHost) {
//		this.redisHost = redisHost;
//	}

//	public void setRedisPort(int redisPort) {
//		this.redisPort = redisPort;
//	}

}
