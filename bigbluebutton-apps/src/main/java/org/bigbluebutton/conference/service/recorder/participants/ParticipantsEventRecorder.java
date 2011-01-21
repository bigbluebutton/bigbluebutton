package org.bigbluebutton.conference.service.recorder.participants;

import java.util.HashMap;

import org.bigbluebutton.conference.IRoomListener;
import org.bigbluebutton.conference.Participant;
import org.bigbluebutton.conference.service.recorder.RecorderApplication;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class ParticipantsEventRecorder implements IRoomListener {
	private static Logger log = Red5LoggerFactory.getLogger( ParticipantsEventRecorder.class, "bigbluebutton" );
	private final RecorderApplication recorder;
	private final String session;
	
	String name = "RECORDER:PARTICIPANT";
		
	public ParticipantsEventRecorder(String session, RecorderApplication recorder) {
		this.recorder = recorder;
		this.session = session;
	}

	@Override
	public void endAndKickAll() {
		HashMap<String, String> map=new HashMap<String, String>();
		map.put("timestamp", Long.toString(System.currentTimeMillis()));
		map.put("module", "participants");
		map.put("event", "leave_all");
		
		recordEvent(map);
	}

	@Override
	public void participantJoined(Participant arg0) {
		HashMap<String, String> map=new HashMap<String, String>();
		map.put("timestamp", Long.toString(System.currentTimeMillis()));
		map.put("module", "participants");
		map.put("event", "join");
		map.put("userid", arg0.getUserid().toString());
		map.put("status", arg0.getStatus().toString());
		map.put("role", arg0.getRole());
		
		recordEvent(map);
	}

	@Override
	public void participantLeft(Long userid) {
		HashMap<String, String> map=new HashMap<String, String>();
		map.put("timestamp", Long.toString(System.currentTimeMillis()));
		map.put("module", "participants");
		map.put("event", "leave");
		map.put("userid", userid.toString());
		
		recordEvent(map);
	}

	@Override
	public void participantStatusChange(Long userid, String status, Object value) {
		HashMap<String, String> map=new HashMap<String, String>();
		map.put("timestamp", Long.toString(System.currentTimeMillis()));
		map.put("module", "participants");
		map.put("event", "status_change");
		map.put("userid", userid.toString());
		map.put("status", status);
		map.put("value", value.toString());
		
		recordEvent(map);
	}

	private void recordEvent(HashMap<String, String> message) {
			recorder.record(session, message);
	}

	@Override
	public String getName() {
		return this.name;
	}

}
