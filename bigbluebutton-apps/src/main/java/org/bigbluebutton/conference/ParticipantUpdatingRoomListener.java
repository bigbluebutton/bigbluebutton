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

package org.bigbluebutton.conference;

import java.util.HashMap;

import org.bigbluebutton.conference.service.messaging.MessagingConstants;
import org.bigbluebutton.conference.service.messaging.RedisPublisher;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

import com.google.gson.Gson;


public class ParticipantUpdatingRoomListener implements IRoomListener{

	private static Logger log = Red5LoggerFactory.getLogger(ParticipantUpdatingRoomListener.class, "bigbluebutton");
	
	RedisPublisher publisher;
	private Room room;
	
	public ParticipantUpdatingRoomListener(Room room, RedisPublisher publisher) {
		this.room = room;
		this.publisher=publisher;
	}
	
	public String getName() {
		return "PARTICIPANT:UPDATE:ROOM";
	}
	
	public void participantStatusChange(Long userid, String status, Object value){
		if (publisher != null) {
			HashMap<String,String> map= new HashMap<String, String>();
			map.put("meetingId", this.room.getName());
			map.put("action", "status");
			map.put("userid", userid.toString());
			map.put("status", status);
			map.put("value", value.toString());
			
			Gson gson= new Gson();
			publisher.publish(MessagingConstants.PARTICIPANTS_CHANNEL, gson.toJson(map));
			log.debug("Publishing a status change in:{}",this.room.getName());
		}
	}
	
	public void participantJoined(Participant p) {
		if (publisher != null) {
			HashMap<String,String> map= new HashMap<String, String>();
			map.put("meetingId", this.room.getName());
			map.put("action", "join");
			map.put("userid", p.getUserid().toString());
			map.put("fullname", p.getName());
			map.put("role", p.getRole());
			
			Gson gson= new Gson();
			publisher.publish(MessagingConstants.PARTICIPANTS_CHANNEL, gson.toJson(map));
			log.debug("Publishing message participant joined in {}",this.room.getName());
		}
	}
	
	public void participantLeft(Long userid) {		
		if (publisher != null) {
			HashMap<String,String> map= new HashMap<String, String>();
			map.put("meetingId", this.room.getName());
			map.put("action", "left");
			map.put("userid", userid.toString());
			
			Gson gson= new Gson();
			publisher.publish(MessagingConstants.PARTICIPANTS_CHANNEL, gson.toJson(map));
			log.debug("Publishing message participant left in {}",this.room.getName());
		}
	}

	public void endAndKickAll() {
		// no-op
	}
	
	
}
