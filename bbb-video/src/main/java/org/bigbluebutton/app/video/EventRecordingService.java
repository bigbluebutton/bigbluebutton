package org.bigbluebutton.app.video;


import java.util.Map;

import redis.clients.jedis.Jedis;

public class EventRecordingService {
	private static final String COLON = ":";
	
	private final String  host;
	private final int port;
	
	public EventRecordingService(String host, int port) {
		this.host = host;
		this.port = port;
	}
	
	public void record(String meetingId, Map<String, String> event) {		
		Jedis jedis = new Jedis(host, port);
		Long msgid = jedis.incr("global:nextRecordedMsgId");
		jedis.hmset("recording:" + meetingId + COLON + msgid, event);
		jedis.rpush("meeting:" + meetingId + COLON + "recordings", msgid.toString());						
	}
}
