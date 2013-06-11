package org.bigbluebutton.conference.service.participants.red5;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import org.bigbluebutton.conference.meeting.messaging.OutMessage;
import org.bigbluebutton.conference.meeting.messaging.OutMessageListener;
import org.bigbluebutton.conference.meeting.messaging.messages.EndAndKickAllMessage;
import org.bigbluebutton.conference.meeting.messaging.red5.ConnectionInvokerService;
import org.bigbluebutton.conference.meeting.messaging.red5.SharedObjectClientMessage;
import org.bigbluebutton.conference.service.participants.messaging.messages.AssignPresenterMessage;
import org.bigbluebutton.conference.service.participants.messaging.messages.UserJoinedMessage;
import org.bigbluebutton.conference.service.participants.messaging.messages.UserLeftMessage;
import org.bigbluebutton.conference.service.participants.messaging.messages.UserStatusChangeMessage;

public class UsersClientMessageSender implements OutMessageListener {
	private static final String USERS_SO = "participantsSO";   
	
	private ConnectionInvokerService service;
	
	@Override
	public void send(OutMessage msg) {
		if (msg instanceof EndAndKickAllMessage) {
			endAndKickAll((EndAndKickAllMessage) msg);
		} else if (msg instanceof AssignPresenterMessage) {
			assignPresenter((AssignPresenterMessage) msg);
		} else if (msg instanceof UserJoinedMessage) {
			userJoined((UserJoinedMessage) msg);
		} else if (msg instanceof UserLeftMessage) {
			userLeft((UserLeftMessage) msg);
		} else if (msg instanceof UserStatusChangeMessage) {
			userStatusChange((UserStatusChangeMessage) msg);
		}
		
	}
	
	public void setConnectionInvokerService(ConnectionInvokerService service) {
		this.service = service;
	}
	
	private void endAndKickAll(EndAndKickAllMessage msg) {
		SharedObjectClientMessage m = new SharedObjectClientMessage(msg.getMeetingID(), USERS_SO, "logout", new ArrayList<Object>());
		service.sendMessage(m);
	}


	private void assignPresenter(AssignPresenterMessage msg) {
		ArrayList<Object> presenter = new ArrayList<Object>();
		presenter.add(msg.getNewPresenterID());
		presenter.add(msg.getNewPresenterName());
		presenter.add(msg.getAssignedBy());
		
		SharedObjectClientMessage m = new SharedObjectClientMessage(msg.getMeetingID(), USERS_SO, "assignPresenterCallback", presenter);
		service.sendMessage(m);		
	}
	

	private void userJoined(UserJoinedMessage msg) {
		Map<String, Object> m = new HashMap<String, Object>();
		m.put("userid", msg.getUserID());
		m.put("externUserID", msg.getExternalUserID());
		m.put("name", msg.getName());
		m.put("role", msg.getRole());
		m.put("status", msg.getStatus());
		
		ArrayList<Object> args = new ArrayList<Object>();
		args.add(m);

		SharedObjectClientMessage som = new SharedObjectClientMessage(msg.getMeetingID(), USERS_SO, "participantJoined", args);
		service.sendMessage(som);
	}


	private void userLeft(UserLeftMessage msg) {
		ArrayList<Object> args = new ArrayList<Object>();
		args.add(msg.getUserID());

		SharedObjectClientMessage m = new SharedObjectClientMessage(msg.getMeetingID(), USERS_SO, "participantLeft", args);
		service.sendMessage(m);
	}

	private void userStatusChange(UserStatusChangeMessage msg) {
		ArrayList<Object> args = new ArrayList<Object>();
		args.add(msg.getUserID());
		args.add(msg.getStatus());
		args.add(msg.getValue());
		
		SharedObjectClientMessage m = new SharedObjectClientMessage(msg.getMeetingID(), USERS_SO, "participantStatusChange", args);
		service.sendMessage(m);
	}



}
