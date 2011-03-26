package org.bigbluebutton.deskshare.server.recorder;

import org.bigbluebutton.deskshare.server.recorder.event.RecordStatusEvent;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

public class EventRecorder implements RecordStatusListener {
	private static final String COLON=":";
	private String host;
	private int port;
	private Jedis jedis;
	public EventRecorder(String host, int port){
		this.host = host;
		this.port = port;
		
//		jedis = new Jedis(host, port);		
//		Config poolConfig = new Config();
//		jpool = new JedisPool(poolConfig, host, port);
	}
	
	@Override
	public void record(String session, RecordEvent message) {
		Jedis jedis = new Jedis(host, port);
		Long msgid = jedis.incr("global:nextRecordedMsgId");
		jedis.hmset("recording" + COLON + session + COLON + msgid, message.toMap());
		jedis.rpush("meeting" + COLON + session + COLON + "recordings", msgid.toString());						
	}
	@Override
	public void notify(RecordStatusEvent event) {
		// TODO Auto-generated method stub
		
	}

	
}
