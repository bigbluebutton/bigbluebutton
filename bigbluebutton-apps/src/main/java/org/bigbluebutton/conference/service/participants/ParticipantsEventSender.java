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

package org.bigbluebutton.conference.service.participants;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.Map;

import org.bigbluebutton.conference.service.recorder.IEventRecorder;
import org.bigbluebutton.conference.service.recorder.IRecordDispatcher;
import org.bigbluebutton.conference.IRoomListener;
import org.bigbluebutton.conference.BigBlueButtonUtils;import org.red5.server.api.so.ISharedObject;
import org.bigbluebutton.conference.Participant;
import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;

public class ParticipantsEventSender implements IEventRecorder, IRoomListener {

	private static Logger log = Red5LoggerFactory.getLogger( ParticipantsEventSender.class, "bigbluebutton" );
	
	IRecordDispatcher recorder;
	private ISharedObject so;
	private final Boolean record;
	
	String name = "PARTICIPANT";
	
	private final String RECORD_EVENT_JOIN="join";
	private final String RECORD_EVENT_LEAVE="leave";
	private final String RECORD_EVENT_STATUS_CHANGE="status_change";
	private final String RECORD_EVENT_LEAVE_ALL="leave_all";
	
	
	public ParticipantsEventSender(ISharedObject so, Boolean record) {
		this.so = so; 
		this.record = record;
	}
	
	@Override
	public void acceptRecorder(IRecordDispatcher recorder) {
		log.debug("Accepting IRecorder");
		this.recorder = recorder;
	}

	@Override
	public String getName() {
		return name;
	}

	@Override
	public void recordEvent(HashMap<String, String> message) {
		if (record) {
			//recorder.record(message);
		}
	}

	@SuppressWarnings({ "rawtypes" })
	@Override
	public void endAndKickAll() {
		so.sendMessage("logout", new ArrayList());
		//recordEvent(parseParticipantsToXML(new ArrayList(), this.RECORD_EVENT_LEAVE_ALL));
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	@Override
	public void participantJoined(Participant p) {
		log.debug("A participant has joined {}.",p.getUserid());
		ArrayList args = new ArrayList();
		args.add(p.toMap());
		log.debug("Sending participantJoined {} to client.",p.getUserid());
		so.sendMessage("participantJoined", args);
		//recordEvent(parseParticipantsToXML(args, this.RECORD_EVENT_JOIN));
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	@Override
	public void participantLeft(Long userid) {
		ArrayList args = new ArrayList();
		args.add(userid);
		so.sendMessage("participantLeft", args);
		//recordEvent(parseParticipantsToXML(args, this.RECORD_EVENT_LEAVE));
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	@Override
	public void participantStatusChange(Long userid, String status, Object value) {
		log.debug("A participant's status has changed "+userid+" "+status+" "+value);
		ArrayList args = new ArrayList();
		args.add(userid);
		args.add(status);
		args.add(value);
		so.sendMessage("participantStatusChange", args);
		//recordEvent(parseParticipantsToXML(args, this.RECORD_EVENT_STATUS_CHANGE));
	}
	
	/****** parse method ********/
	@SuppressWarnings("unchecked")
	private String parseParticipantsToJSON(ArrayList list, String type){
		String json="{ ";
		
		json+="\"module\":\"participants\", ";
		if(type.equalsIgnoreCase(this.RECORD_EVENT_STATUS_CHANGE)){
			json+="\"event\":\""+this.RECORD_EVENT_STATUS_CHANGE+"\", ";
			json+="\"userid\":\""+list.get(0)+"\", ";
			json+="\"status\":\""+list.get(1)+"\", ";
			json+="\"value\":\""+list.get(2)+"\" ";
		}
		else if(type.equalsIgnoreCase(this.RECORD_EVENT_JOIN)){
			Map map=(Map) list.get(0);
			json+="\"event\":\""+this.RECORD_EVENT_JOIN+"\", ";
			json+="\"userid\":\""+map.get("userid")+"\", ";
			json+="\"name\":\""+map.get("name")+"\", ";
			json+="\"role\":\""+map.get("role")+"\" ";
		}
		else if(type.equalsIgnoreCase(this.RECORD_EVENT_LEAVE)){
			json+="\"event\":\""+this.RECORD_EVENT_LEAVE+"\", ";
			json+="\"userid\":\""+list.get(0)+"\" ";
		}
		else if(type.equalsIgnoreCase(this.RECORD_EVENT_LEAVE_ALL)){
			json+="\"event\":\""+this.RECORD_EVENT_LEAVE_ALL+"\" ";			
		}
		json+="}";
		return json;
	}
	
	/***********************************************************
	 * Participants XML Test
	 ***********************************************************/
	@SuppressWarnings({ "unchecked", "rawtypes" })
	private String parseParticipantsToXML(ArrayList list, String type){
		Hashtable keyvalues=new Hashtable();
		if(type.equalsIgnoreCase(this.RECORD_EVENT_STATUS_CHANGE)){
			keyvalues.put("event", this.RECORD_EVENT_STATUS_CHANGE);
			keyvalues.put("userid", list.get(0));
			keyvalues.put("status", list.get(1));
			keyvalues.put("value", list.get(2));
			
		}
		else if(type.equalsIgnoreCase(this.RECORD_EVENT_JOIN)){
			Map map=(Map) list.get(0);
			keyvalues.put("event", this.RECORD_EVENT_JOIN);
			keyvalues.put("userid", map.get("userid"));
			keyvalues.put("status", map.get("name"));
			keyvalues.put("value", map.get("role"));
		}
		else if(type.equalsIgnoreCase(this.RECORD_EVENT_LEAVE)){
			keyvalues.put("event", this.RECORD_EVENT_LEAVE);
			keyvalues.put("userid", list.get(0));
		}
		else if(type.equalsIgnoreCase(this.RECORD_EVENT_LEAVE_ALL)){
			keyvalues.put("event", this.RECORD_EVENT_LEAVE_ALL);
		}
		return BigBlueButtonUtils.parseEventsToXML("participants", keyvalues);
	}
}
