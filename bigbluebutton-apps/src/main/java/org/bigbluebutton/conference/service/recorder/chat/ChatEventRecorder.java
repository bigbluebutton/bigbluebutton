/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
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
