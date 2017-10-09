package org.bigbluebutton.api.messaging.messages;


public class RegisterUser implements IMessage {

	public final String meetingID;
	public final String internalUserId;
	public final String fullname;
	public final String role;
	public final String externUserID;
	public final String authToken;
	public final String avatarURL;
	public final Boolean guest;
	public final Boolean authed;
	public final String guestStatus;
	
	public RegisterUser(String meetingID, String internalUserId, String fullname, String role, String externUserID,
						String authToken, String avatarURL, Boolean guest,
						Boolean authed, String guestStatus) {
		this.meetingID = meetingID;
		this.internalUserId = internalUserId;
		this.fullname = fullname;
		this.role = role;
		this.externUserID = externUserID;
		this.authToken = authToken;		
		this.avatarURL = avatarURL;		
		this.guest = guest;
		this.authed = authed;
		this.guestStatus = guestStatus;
	}
}
