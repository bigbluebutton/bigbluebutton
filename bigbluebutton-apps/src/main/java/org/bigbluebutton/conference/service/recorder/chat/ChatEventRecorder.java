package org.bigbluebutton.conference.service.recorder.chat;

import java.util.Hashtable;

import org.bigbluebutton.conference.BigBlueButtonUtils;
import org.bigbluebutton.conference.service.chat.IChatRoomListener;
import org.bigbluebutton.conference.service.recorder.RecorderApplication;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class ChatEventRecorder implements IChatRoomListener {
	private static Logger log = Red5LoggerFactory.getLogger( ChatEventRecorder.class, "bigbluebutton" );
	
	private final RecorderApplication recorder;
	private final String session;
	
	String name = "RECORDER:CHAT";
	
	public ChatEventRecorder(String session, RecorderApplication recorder){
		this.recorder = recorder;
		this.session = session;
	}
	
	public String getName() {
		return name;
	}

	@Override
	public void newChatMessage(String message) {
		recorder.record(session, buildEvent(message));		
	}
	
	private PublicChatRecordEvent buildEvent(String message) {
		PublicChatRecordEvent ev = new PublicChatRecordEvent();
		ev.setTimestamp(System.currentTimeMillis());
		ev.setMeetingId(session);
		String[] chatAttribs = message.trim().split("\\|",-1);
		ev.setSender(chatAttribs[1]);
		ev.setMessage(chatAttribs[0]);
		ev.setLocale(chatAttribs[4]);
		ev.setColor(chatAttribs[2]);
		return ev;
	}
}
