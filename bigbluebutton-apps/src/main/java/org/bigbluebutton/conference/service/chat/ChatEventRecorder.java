/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
* 
*/

package org.bigbluebutton.conference.service.chat;

import java.util.ArrayList;
import java.util.Hashtable;
import java.util.List;
import org.bigbluebutton.conference.service.recorder.IEventRecorder;
import org.bigbluebutton.conference.service.recorder.IRecorder;
import org.bigbluebutton.conference.service.chat.IChatRoomListener;import org.red5.server.api.so.ISharedObject;
import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;

public class ChatEventRecorder implements IEventRecorder, IChatRoomListener {

private static Logger log = Red5LoggerFactory.getLogger( ChatEventRecorder.class, "bigbluebutton" );
	
	IRecorder recorder;
	private ISharedObject so;
	private final Boolean record;
	
	String name = "CHAT";
	
	public ChatEventRecorder(ISharedObject so, Boolean record) {
		this.so = so; 
		this.record = record;
	}
	
	
	@Override
	public void acceptRecorder(IRecorder recorder) {
		log.debug("Accepting IRecorder");
		this.recorder = recorder;
	}

	@Override
	public String getName() {
		return name;
	}

	@Override
	public void recordEvent(String message) {
		if(record){
			//recorder.recordEvent(parseChatToJSON(message));
			recorder.recordEvent(parseChatToXML(message));
		}
	}

	@SuppressWarnings("unchecked")
	@Override
	public void newChatMessage(String message) {
		log.debug("New chat message...");
		List list=new ArrayList();
		list.add(message);
		so.sendMessage("newChatMessage", list);
		recordEvent(message);
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
	@SuppressWarnings("unchecked")
	private String parseChatToXML(String message){
		String[] chat_attribs=message.trim().split("\\|",-1);
		
		Hashtable keyvalues=new Hashtable();
		keyvalues.put("event", "new_message");
		keyvalues.put("message", chat_attribs[0]);
		keyvalues.put("user", chat_attribs[1]);
		keyvalues.put("color", chat_attribs[2]);
		keyvalues.put("language", chat_attribs[4]);
		
		String xmlstr=recorder.parseEventsToXML("chat", keyvalues);
		return xmlstr;
	}
}
