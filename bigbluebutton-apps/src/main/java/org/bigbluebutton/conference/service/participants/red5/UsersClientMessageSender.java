package org.bigbluebutton.conference.service.participants.red5;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import org.bigbluebutton.conference.User;
import org.bigbluebutton.conference.meeting.messaging.red5.ClientMessage;

public class UsersClientMessageSender {

	public void endAndKickAll() {
		so.sendMessage("logout", new ArrayList());
		
		Map<String, Object> message = new HashMap<String, Object>();
		message.put("enabled", enabled);
		ClientMessage m = new ClientMessage(ClientMessage.BROADCAST, meetingID, "WhiteboardEnableWhiteboardCommand", message);
		service.sendMessage(m);
	}


	public void assignPresenter(ArrayList<String> presenter) {
		so.sendMessage("assignPresenterCallback", presenter);
	}
	

	public void participantJoined(User p) {
		ArrayList args = new ArrayList();
		args.add(p.toMap());
		log.debug("Sending participantJoined " + p.getExternalUserID() + " to client.");
		so.sendMessage("participantJoined", args);
	}


	public void participantLeft(User p) {
		ArrayList args = new ArrayList();
		args.add(p.getInternalUserID());
		so.sendMessage("participantLeft", args);
	}

	public void participantStatusChange(User p, String status, Object value) {
		ArrayList args = new ArrayList();
		args.add(p.getInternalUserID());
		args.add(status);
		args.add(value);
		so.sendMessage("participantStatusChange", args);
	}

}
