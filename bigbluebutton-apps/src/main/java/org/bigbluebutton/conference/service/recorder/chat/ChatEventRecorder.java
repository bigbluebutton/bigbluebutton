package org.bigbluebutton.conference.service.recorder.chat;

import java.util.HashMap;
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
	
	/*
	 * <font color="#0"><b>[markos - 12:06:38 PM]</b> heyyyyy </font><br/>
	 * 
	 * */
	private String parseChatToJSON(String message){
		String json="{ ";
		String[] chat_attribs=message.trim().split("\\|",-1);
		
		json+="\"module\":\"chat\", ";
		json+="\"event\":\"new_message\", ";
		json+="\"user\":\""+chat_attribs[1]+"\", ";
		json+="\"text\":\""+chat_attribs[0]+"\", ";
		json+="\"language\":\""+chat_attribs[4]+"\", ";
		json+="\"color\":\""+chat_attribs[2]+"\" }";
		
		return json;
	}
	
	/********************************
	 *  Testing performance XML over the playback client
	 *  chat message format: <message>|<user>|<color>|<time>|<language>
	 * ****************************/
	@SuppressWarnings({ "unchecked", "rawtypes" })
	private String parseChatToXML(String message){
		String[] chat_attribs=message.trim().split("\\|",-1);
		
		Hashtable keyvalues=new Hashtable();
		keyvalues.put("event", "new_message");
		keyvalues.put("message", chat_attribs[0]);
		keyvalues.put("user", chat_attribs[1]);
		keyvalues.put("color", chat_attribs[2]);
		keyvalues.put("language", chat_attribs[4]);
		
		String xmlstr=BigBlueButtonUtils.parseEventsToXML("chat", keyvalues);
		return xmlstr;
	}

}
