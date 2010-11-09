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
		if(record)
			recorder.recordEvent(parseChatToJSON(message));
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
		int idx_ini=message.indexOf("color=")+7;
		int idx_end=message.indexOf("\">", idx_ini);
		String color=message.substring(idx_ini, idx_end);
		
		idx_ini=message.indexOf("<b>")+4;
		idx_end=message.indexOf("</b>", idx_ini)-13;
		String user=message.substring(idx_ini,idx_end);
		
		idx_ini=message.indexOf("</b>")+4;
		idx_end=message.indexOf("</font>", idx_ini);
		String text=message.substring(idx_ini,idx_end);
		
		json+="\"module\":\"chat\", ";
		json+="\"event\":\"new_message\", ";
		json+="\"user\":\""+user.trim()+"\", ";
		json+="\"text\":\""+text.trim()+"\", ";
		json+="\"color\":\""+color.trim()+"\" }";
		
		return json;
	}

}
