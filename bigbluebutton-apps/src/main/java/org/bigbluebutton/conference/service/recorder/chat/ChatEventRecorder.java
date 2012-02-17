package org.bigbluebutton.conference.service.recorder.chat;

import java.util.Hashtable;

import org.bigbluebutton.conference.BigBlueButtonUtils;
import org.bigbluebutton.conference.service.chat.ChatObject;
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
	public void newChatMessage(ChatObject chatobj) {
		recorder.record(session, buildEvent(chatobj));		
	}
	
	private PublicChatRecordEvent buildEvent(ChatObject chatobj) {
		PublicChatRecordEvent ev = new PublicChatRecordEvent();
		ev.setTimestamp(System.currentTimeMillis());
		ev.setMeetingId(session);
		ev.setSender(chatobj.username);
		ev.setMessage(chatobj.message);
		ev.setLocale(chatobj.language);
		ev.setColor(chatobj.color);
		return ev;
	}
}
