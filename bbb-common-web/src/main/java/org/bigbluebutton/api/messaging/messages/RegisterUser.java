package org.bigbluebutton.api.messaging.messages;


import java.util.Map;

public class RegisterUser implements IMessage {

	public final String meetingID;
	public final String internalUserId;
	public final String fullname;
	public final String role;
	public final String externUserID;
	public final String authToken;
	public final String sessionToken;
	public final String avatarURL;
	public final String webcamBackgroundURL;
	public final Boolean bot;
	public final Boolean guest;
	public final Boolean authed;
	public final String guestStatus;
	public final Boolean excludeFromDashboard;
	public final Boolean leftGuestLobby;
	public final String enforceLayout;
	public final String logoutUrl;
	public final Map<String, String> userMetadata;

	public RegisterUser(String meetingID, String internalUserId, String fullname, String role, String externUserID,
						String authToken, String sessionToken, String avatarURL, String webcamBackgroundURL, Boolean bot, Boolean guest,
						Boolean authed, String guestStatus, Boolean excludeFromDashboard, Boolean leftGuestLobby,
						String enforceLayout, String logoutUrl, Map<String, String> userMetadata) {
		this.meetingID = meetingID;
		this.internalUserId = internalUserId;
		this.fullname = fullname;
		this.role = role;
		this.externUserID = externUserID;
		this.authToken = authToken;
		this.sessionToken = sessionToken;
		this.avatarURL = avatarURL;
		this.webcamBackgroundURL = webcamBackgroundURL;
		this.bot = bot;
		this.guest = guest;
		this.authed = authed;
		this.guestStatus = guestStatus;
		this.excludeFromDashboard = excludeFromDashboard;
		this.leftGuestLobby = leftGuestLobby;
		this.enforceLayout = enforceLayout;
		this.logoutUrl = logoutUrl;
		this.userMetadata = userMetadata;
	}
}
