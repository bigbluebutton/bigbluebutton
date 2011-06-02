package org.bigbluebutton.api;

import org.bigbluebutton.api.domain.DynamicConference;
import redis.clients.jedis.Jedis;

public class RedisDispatcherImp implements IRedisDispatcher {
	@Override
	public void createConferenceRecord(DynamicConference conf, String redisHost, int redisPort) {
		Jedis jedis = new Jedis(redisHost, redisPort);
		jedis.hmset("meeting:" + conf.getMeetingToken() + ":metadata", conf.getMetadata());
	}
}
