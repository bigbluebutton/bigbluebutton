package org.bigbluebutton.api.messaging.converters.messages;

public class RegisterUserMessage {
	public static final String REGISTER_USER                 = "register_user_request";
	public final String VERSION = "0.0.1";
	
	public final String meetingID;
	public final String internalUserId;
	public final String fullname;
	public final String role;
	public final String externUserID;
	public final String authToken;
	public final String avatarURL;
	
	public RegisterUserMessage(String meetingID, String internalUserId, String fullname, String role, String externUserID, String authToken, String avatarURL) {
		this.meetingID = meetingID;
		this.internalUserId = internalUserId;
		this.fullname = fullname;
		this.role = role;
		this.externUserID = externUserID;	
		this.authToken = authToken;
		this.avatarURL = avatarURL;
	}
}
