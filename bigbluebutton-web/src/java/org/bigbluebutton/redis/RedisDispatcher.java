package org.bigbluebutton.redis;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class RedisDispatcher extends RedisServer{

	private static Logger log = LoggerFactory.getLogger(RedisDispatcher.class);
	
	public RedisDispatcher(String server, int port) {
		super(server, port);
		log.debug("RedisDispatcher server connected");
	}

	public void publish(String channel, String message){
		log.debug("sending {} to {}",message,channel);
		jedis.publish(channel, message);
	}
	
}
