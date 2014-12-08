package org.bigbluebutton.conference.service.messaging;

public class ValidateAuthTokenMessage implements IMessage {
	public static final String VALIDATE_AUTH_TOKEN  = "validate_auth_token";
	public static final String VERSION = "0.0.1";
	
	public final String meetingId;
	public final String userId;
	public final String token;
	public final String replyTo;
	
	public ValidateAuthTokenMessage(String meetingId, String userId, String token, String replyTo) {
		this.meetingId = meetingId;
		this.userId = userId;
		this.token = token;
		this.replyTo = replyTo;	
	}
}
