package org.bigbluebutton.conference.service.participants.messaging.messages;


import java.util.Map;
import org.bigbluebutton.conference.meeting.messaging.OutMessage;

public class UserJoinedMessage extends OutMessage {

	private final String userID;
	private final String externalUserID;
	private final String name;
	private final String role;
	private final Map<String, Object> status;
	
	public UserJoinedMessage(String meetingID, Boolean recorded, String internalUserID, 
			String externalUserID, String name, String role, Map<String, Object> status) {
		super(meetingID, recorded);
		this.userID = internalUserID;
		this.externalUserID = externalUserID;
		this.name = name;
		this.role = role;
		this.status = status;
	}

	public String getUserID() {
		return userID;
	}

	public String getExternalUserID() {
		return externalUserID;
	}

	public String getName() {
		return name;
	}

	public String getRole() {
		return role;
	}
	
	public Map<String, Object> getStatus() {
		return status;
	}
}
