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

import org.bigbluebutton.conference.service.chat.IChatRoomListener;import org.red5.server.api.so.ISharedObject;
import org.red5.server.api.statistics.ISharedObjectStatistics;
import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;

public class ChatMessageSender implements IChatRoomListener {

private static Logger log = Red5LoggerFactory.getLogger( ChatMessageSender.class, "bigbluebutton" );
	
	private ISharedObject so;
	
	String name = "CHAT";
	
	public ChatMessageSender(ISharedObject so) {
		this.so = so; 
	}

	@Override
	public void newChatMessage(ChatObject chatobj) {
		List<ChatObject> list = new ArrayList<ChatObject>();
		list.add(chatobj);
		
		log.debug("Sending public chat message [" + chatobj.message + "]");
		if (so.isLocked()) log.info("Chat message SO is locked");
		if (so.isAcquired()) log.info("Chat message SO is acquired");
		ISharedObjectStatistics stats = so.getStatistics();
		log.debug("Before: Chat SO stats [total-sends=" + stats.getTotalSends() + "]");
		so.sendMessage("newChatMessage", list);
		log.debug("After: Chat SO stats [total-sends=" + stats.getTotalSends() + "]");
		if (so.isLocked()) log.info("Chat message SO is locked");
		if (so.isAcquired()) log.info("Chat message SO is acquired");
	}

	@Override
	public String getName() {
		// TODO Auto-generated method stub
		return name;
	}
}
