package org.bigbluebutton.conference.service.recorder;

import java.util.HashMap;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

public class RedisDispatcher implements IRecordDispatcher {

	//private String server;
	//private int port;
	private static final String SEPARATOR_CHAR=":";
	Jedis jedis;
	String meeting;
	
	public RedisDispatcher(String conference){
		//JedisPool jpool=new JedisPool("localhost", 6379);
		jedis=new Jedis("localhost", 6379);
		this.meeting=conference;
		jedis.lpush("global"+SEPARATOR_CHAR+"recordedMeetings", conference);
		
	}
	@Override
	public void record(HashMap<String,String> message) {
		Long msgid=jedis.incr("global:nextRecordedMsgId");
		jedis.hmset("recording"+SEPARATOR_CHAR+msgid, message);
		jedis.rpush("meeting"+SEPARATOR_CHAR+this.meeting+SEPARATOR_CHAR+"recordings", msgid.toString());
	}

	/*public String getServer() {
		return server;
	}
	public void setServer(String server) {
		this.server = server;
	}
	
	public int getPort() {
		return port;
	}
	public void setPort(int port) {
		this.port = port;
	}*/
}
