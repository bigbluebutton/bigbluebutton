package org.bigbluebutton.conference.service.recorder.chat;

import org.bigbluebutton.conference.service.chat.ChatMessageVO;
import org.bigbluebutton.conference.service.chat.IChatRoomListener;
import org.bigbluebutton.conference.service.recorder.RecorderApplication;

public class ChatEventRecorder implements IChatRoomListener {	
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
	public void newChatMessage(ChatMessageVO chatobj) {
		recorder.record(session, buildEvent(chatobj));		
	}
	
	private PublicChatRecordEvent buildEvent(ChatMessageVO chatobj) {
		PublicChatRecordEvent ev = new PublicChatRecordEvent();
		ev.setTimestamp(System.currentTimeMillis());
		ev.setMeetingId(session);
		ev.setSender(chatobj.fromUsername);
		ev.setMessage(chatobj.message);
		ev.setLocale(chatobj.fromLang);
		ev.setColor(chatobj.fromColor);
		return ev;
	}
}
