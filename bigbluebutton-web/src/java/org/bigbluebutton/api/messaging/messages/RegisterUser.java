package org.bigbluebutton.api.messaging.messages;

public class RegisterUser implements IMessage {

	public final String meetingID;
	public final String internalUserId;
	public final String fullname;
	public final String role;
	public final String externUserID;
	public final String authToken;
	
	public RegisterUser(String meetingID, String internalUserId, String fullname, String role, String externUserID, String authToken) {
		this.meetingID = meetingID;
		this.internalUserId = internalUserId;
		this.fullname = fullname;
		this.role = role;
		this.externUserID = externUserID;
		this.authToken = authToken;		
	}
}
