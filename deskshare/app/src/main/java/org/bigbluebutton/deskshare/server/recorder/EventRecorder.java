package org.bigbluebutton.deskshare.server.recorder;

import org.bigbluebutton.deskshare.server.recorder.event.AbstractDeskshareRecordEvent;
import org.bigbluebutton.deskshare.server.recorder.event.RecordEvent;
import org.bigbluebutton.deskshare.server.recorder.event.RecordStartedEvent;
import org.bigbluebutton.deskshare.server.recorder.event.RecordStoppedEvent;

import redis.clients.jedis.Jedis;

public class EventRecorder implements RecordStatusListener {
	private static final String COLON=":";
	private String host;
	private int port;

	public EventRecorder(String host, int port){
		this.host = host;
		this.port = port;		
	}
	
	private void record(String session, RecordEvent message) {
		Jedis jedis = new Jedis(host, port);
		Long msgid = jedis.incr("global:nextRecordedMsgId");
		jedis.hmset("recording" + COLON + session + COLON + msgid, message.toMap());
		jedis.rpush("meeting" + COLON + session + COLON + "recordings", msgid.toString());						
	}
	
	@Override
	public void notify(RecordEvent event) {
		if ((event instanceof RecordStoppedEvent) || (event instanceof RecordStartedEvent)) {
			event.setTimestamp(System.currentTimeMillis());
			event.setMeetingId(((AbstractDeskshareRecordEvent)event).getSession());
			record(((AbstractDeskshareRecordEvent)event).getSession(), event);
		}
	}
}
