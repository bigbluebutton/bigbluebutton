package org.bigbluebutton.conference.service.participants.red5;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import org.bigbluebutton.conference.meeting.messaging.red5.ConnectionInvokerService;
import org.bigbluebutton.conference.meeting.messaging.red5.SharedObjectClientMessage;
import org.bigbluebutton.core.api.IOutMessageListener;
import org.bigbluebutton.core.api.OutMessage;
import org.bigbluebutton.core.apps.users.messages.AssignPresenter;
import org.bigbluebutton.core.apps.users.messages.EndAndKickAll;
import org.bigbluebutton.core.apps.users.messages.UserJoined;
import org.bigbluebutton.core.apps.users.messages.UserLeft;
import org.bigbluebutton.core.apps.users.messages.UserStatusChange;

public class UsersMessageSender implements IOutMessageListener {
	private static final String USERS_SO = "participantsSO";   
	
	private ConnectionInvokerService service;
	
	@Override
	public void handleMessage(OutMessage msg) {
		if (msg instanceof EndAndKickAll) {
			endAndKickAll((EndAndKickAll) msg);
		} else if (msg instanceof AssignPresenter) {
			assignPresenter((AssignPresenter) msg);
		} else if (msg instanceof UserJoined) {
			userJoined((UserJoined) msg);
		} else if (msg instanceof UserLeft) {
			userLeft((UserLeft) msg);
		} else if (msg instanceof UserStatusChange) {
			userStatusChange((UserStatusChange) msg);
		}
		
	}
	
	public void setConnectionInvokerService(ConnectionInvokerService service) {
		this.service = service;
	}
	
	private void endAndKickAll(EndAndKickAll msg) {
		SharedObjectClientMessage m = new SharedObjectClientMessage(msg.meetingID(), USERS_SO, "logout", new ArrayList<Object>());
		service.sendMessage(m);
	}


	private void assignPresenter(AssignPresenter msg) {
		ArrayList<Object> presenter = new ArrayList<Object>();
		presenter.add(msg.newPresenterID());
		presenter.add(msg.newPresenterName());
		presenter.add(msg.assignedBy());
		
		SharedObjectClientMessage m = new SharedObjectClientMessage(msg.meetingID(), USERS_SO, "assignPresenterCallback", presenter);
		service.sendMessage(m);		
	}
	

	private void userJoined(UserJoined msg) {
		Map<String, Object> m = new HashMap<String, Object>();
		m.put("userid", msg.internalUserID());
		m.put("externUserID", msg.externalUserID());
		m.put("name", msg.name());
		m.put("role", msg.role());
		m.put("status", msg.status());
		
		ArrayList<Object> args = new ArrayList<Object>();
		args.add(m);

		SharedObjectClientMessage som = new SharedObjectClientMessage(msg.meetingID(), USERS_SO, "participantJoined", args);
		service.sendMessage(som);
	}


	private void userLeft(UserLeft msg) {
		ArrayList<Object> args = new ArrayList<Object>();
		args.add(msg.meetingID());

		SharedObjectClientMessage m = new SharedObjectClientMessage(msg.meetingID(), USERS_SO, "participantLeft", args);
		service.sendMessage(m);
	}

	private void userStatusChange(UserStatusChange msg) {
		ArrayList<Object> args = new ArrayList<Object>();
		args.add(msg.userID());
		args.add(msg.status());
		args.add(msg.value());
		
		SharedObjectClientMessage m = new SharedObjectClientMessage(msg.meetingID(), USERS_SO, "participantStatusChange", args);
		service.sendMessage(m);
	}



}
