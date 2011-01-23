package org.bigbluebutton.conference.service.recorder;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

public class RedisDispatcher implements Recorder {

	//private String server;
	//private int port;
	private static final String COLON=":";
	Jedis jedis;
	
	public RedisDispatcher(String host, int port){
		//JedisPool jpool=new JedisPool("localhost", 6379);
		jedis = new Jedis(host, port);		
	}
	
	@Override
	public void record(String session, RecordEvent message) {
		Long msgid = jedis.incr("global:nextRecordedMsgId");
		jedis.hmset("recording" + COLON + session + COLON + msgid, message.toMap());
		jedis.rpush("meeting" + COLON + session + COLON + "recordings", msgid.toString());
	}
}
