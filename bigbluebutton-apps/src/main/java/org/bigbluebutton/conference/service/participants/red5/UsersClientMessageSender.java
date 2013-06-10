package org.bigbluebutton.conference.service.participants.red5;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import org.bigbluebutton.conference.User;
import org.bigbluebutton.conference.meeting.messaging.red5.ClientMessage;
import org.bigbluebutton.conference.meeting.messaging.red5.ConnectionInvokerService;
import org.bigbluebutton.conference.meeting.messaging.red5.SharedObjectClientMessage;

public class UsersClientMessageSender {
	private static final String USERS_SO = "participantsSO";   
	
	private ConnectionInvokerService service;
	
	public void setConnectionInvokerService(ConnectionInvokerService service) {
		this.service = service;
	}
	
	public void endAndKickAll(String meetingID) {
		SharedObjectClientMessage m = new SharedObjectClientMessage(meetingID, USERS_SO, "logout", new ArrayList<Object>());
		service.sendMessage(m);
	}


	public void assignPresenter(String meetingID, ArrayList<Object> presenter) {
		SharedObjectClientMessage m = new SharedObjectClientMessage(meetingID, USERS_SO, "assignPresenterCallback", presenter);
		service.sendMessage(m);		
	}
	

	public void participantJoined(String meetingID, User p) {
		ArrayList args = new ArrayList<Object>();
		args.add(p.toMap());

		SharedObjectClientMessage m = new SharedObjectClientMessage(meetingID, USERS_SO, "participantJoined", args);
		service.sendMessage(m);
	}


	public void participantLeft(String meetingID, User p) {
		ArrayList<Object> args = new ArrayList<Object>();
		args.add(p.getInternalUserID());

		SharedObjectClientMessage m = new SharedObjectClientMessage(meetingID, USERS_SO, "participantLeft", args);
		service.sendMessage(m);
	}

	public void participantStatusChange(String meetingID, User p, String status, Object value) {
		ArrayList<Object> args = new ArrayList<Object>();
		args.add(p.getInternalUserID());
		args.add(status);
		args.add(value);;
		
		SharedObjectClientMessage m = new SharedObjectClientMessage(meetingID, USERS_SO, "participantStatusChange", args);
		service.sendMessage(m);
	}

}
