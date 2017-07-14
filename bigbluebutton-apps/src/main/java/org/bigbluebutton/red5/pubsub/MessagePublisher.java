package org.bigbluebutton.red5.pubsub;

import java.util.Map;

import org.bigbluebutton.common.messages.*;
import org.bigbluebutton.client.IClientInGW;

public class MessagePublisher {

	private IClientInGW sender;
	
	public void setMessageSender(IClientInGW sender) {
		this.sender = sender;
	}
	
	// Polling 
	public void votePoll(String meetingId, String userId, String pollId, Integer questionId, Integer answerId) {
		VotePollUserRequestMessage msg = new VotePollUserRequestMessage(meetingId, userId, pollId, questionId, answerId);
		sender.send(MessagingConstants.TO_POLLING_CHANNEL, msg.toJson());
	}

	public void sendPollingMessage(String json) {		
		sender.send(MessagingConstants.TO_POLLING_CHANNEL, json);
	}
	
	public void startPoll(String meetingId, String requesterId, String pollId, String pollType) {
		StartPollRequestMessage msg = new StartPollRequestMessage(meetingId, requesterId, pollId, pollType);
		sender.send(MessagingConstants.TO_POLLING_CHANNEL, msg.toJson());
	}
	
	public void stopPoll(String meetingId, String userId, String pollId) {
		StopPollRequestMessage msg = new StopPollRequestMessage(meetingId, userId, pollId);
		sender.send(MessagingConstants.TO_POLLING_CHANNEL, msg.toJson());
	}
	
	public void showPollResult(String meetingId, String requesterId, String pollId, Boolean show) {
		ShowPollResultRequestMessage msg = new ShowPollResultRequestMessage(meetingId, requesterId, pollId, show);
		sender.send(MessagingConstants.TO_POLLING_CHANNEL, msg.toJson());
	}
	
	public void initLockSettings(String meetingID, Map<String, Boolean> permissions) {
		InitPermissionsSettingMessage msg = new InitPermissionsSettingMessage(meetingID, permissions);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());
	}

	public void sendLockSettings(String meetingID, String userId, Map<String, Boolean> settings) {
		SendLockSettingsMessage msg = new SendLockSettingsMessage(meetingID, userId, settings);
		sender.send(MessagingConstants.TO_MEETING_CHANNEL, msg.toJson());
	}

	public void getLockSettings(String meetingId, String userId) {
		GetLockSettingsMessage msg = new GetLockSettingsMessage(meetingId, userId);
		sender.send(MessagingConstants.TO_MEETING_CHANNEL, msg.toJson());
	}

	public void lockUser(String meetingId, String requesterID, boolean lock, String internalUserID) {
		LockUserMessage msg = new LockUserMessage(meetingId, requesterID, lock, internalUserID);
		sender.send(MessagingConstants.TO_MEETING_CHANNEL, msg.toJson());
	}

	public void validateAuthToken(String meetingId, String userId, String token, String correlationId, String sessionId) {
		ValidateAuthTokenMessage msg = new ValidateAuthTokenMessage(meetingId, userId, token, correlationId, sessionId);
		sender.send(MessagingConstants.TO_MEETING_CHANNEL, msg.toJson());
	}

	public void userEmojiStatus(String meetingId, String userId, String emojiStatus) {
		UserEmojiStatusMessage msg = new UserEmojiStatusMessage(meetingId, userId, emojiStatus);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());
	}

	public void shareWebcam(String meetingId, String userId, String stream) {
		UserShareWebcamRequestMessage msg = new UserShareWebcamRequestMessage(meetingId, userId, stream);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());
	}

	public void unshareWebcam(String meetingId, String userId, String stream) {
		UserUnshareWebcamRequestMessage msg = new UserUnshareWebcamRequestMessage(meetingId, userId, stream);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());
	}

	public void setUserStatus(String meetingId, String userId, String status, Object value) {
		SetUserStatusRequestMessage msg = new SetUserStatusRequestMessage(meetingId, userId, status, value.toString());
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());
	}

	public void getUsers(String meetingId, String requesterId) {
		GetUsersRequestMessage msg = new GetUsersRequestMessage(meetingId, requesterId);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());
	}

	public void userLeft(String meetingId, String userId, String sessionId) {
		UserLeavingMessage msg = new UserLeavingMessage(meetingId, userId);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());
	}

	public void assignPresenter(String meetingId, String newPresenterID, String newPresenterName, String assignedBy) {
		AssignPresenterRequestMessage msg = new AssignPresenterRequestMessage(meetingId, newPresenterID, newPresenterName, assignedBy);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());
	}

	public void setRecordingStatus(String meetingId, String userId, Boolean recording) {
		SetRecordingStatusRequestMessage msg = new SetRecordingStatusRequestMessage(meetingId, userId, recording);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());
	}

	public void getRecordingStatus(String meetingId, String userId) {
		GetRecordingStatusRequestMessage msg = new GetRecordingStatusRequestMessage(meetingId, userId);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());		
	}

	public void getGuestPolicy(String meetingID, String userID) {
		GetGuestPolicyMessage msg = new GetGuestPolicyMessage(meetingID, userID);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());
	}

	public void newGuestPolicy(String meetingID, String guestPolicy, String setBy) {
		SetGuestPolicyMessage msg = new SetGuestPolicyMessage(meetingID, guestPolicy, setBy);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());
	}

	public void responseToGuest(String meetingID, String userID, Boolean response, String requesterID) {
		RespondToGuestMessage msg = new RespondToGuestMessage(meetingID, userID, response, requesterID);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());
	}

	public void setParticipantRole(String meetingID, String userID, String role) {
		ChangeUserRoleMessage msg = new ChangeUserRoleMessage(meetingID, userID, role);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());
	}

	public void initAudioSettings(String meetingID, String requesterID, Boolean muted) {
		InitAudioSettingsMessage msg = new InitAudioSettingsMessage(meetingID, requesterID, muted);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());	
	}

	public void muteAllExceptPresenter(String meetingID, String requesterID, Boolean mute) {
		MuteAllExceptPresenterRequestMessage msg = new MuteAllExceptPresenterRequestMessage(meetingID, requesterID, mute);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());	
	}

	public void muteAllUsers(String meetingID, String requesterID, Boolean mute) {
		MuteAllRequestMessage msg = new MuteAllRequestMessage(meetingID, requesterID, mute);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());	
	}

	public void isMeetingMuted(String meetingID, String requesterID) {
		IsMeetingMutedRequestMessage msg = new IsMeetingMutedRequestMessage(meetingID, requesterID);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());	
	}

	public void muteUser(String meetingID, String requesterID, String userID, Boolean mute) {
		MuteUserRequestMessage msg = new MuteUserRequestMessage(meetingID, requesterID, userID, mute);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());	

	}

	public void lockMuteUser(String meetingID, String requesterID, String userID, Boolean lock) {
		LockMuteUserRequestMessage msg = new LockMuteUserRequestMessage(meetingID, requesterID, userID, lock);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());	
	}

	public void ejectUserFromVoice(String meetingID, String userId, String ejectedBy) {
		EjectUserFromVoiceRequestMessage msg = new EjectUserFromVoiceRequestMessage(meetingID, ejectedBy, userId);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());	
	}

	public void ejectUserFromMeeting(String meetingId, String userId, String ejectedBy) {
		EjectUserFromMeetingRequestMessage msg = new EjectUserFromMeetingRequestMessage(meetingId, userId, ejectedBy);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());
	}

	public void getCurrentLayout(String meetingID, String requesterID) {
		GetCurrentLayoutRequestMessage msg = new GetCurrentLayoutRequestMessage(meetingID, requesterID);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());
	}

	public void broadcastLayout(String meetingID, String requesterID, String layout) {
		BroadcastLayoutRequestMessage msg = new BroadcastLayoutRequestMessage(meetingID, requesterID, layout);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());
	}

	public void lockLayout(String meetingID, String setById, boolean lock, boolean viewersOnly, String layout) {
		LockLayoutRequestMessage msg = new LockLayoutRequestMessage(meetingID, setById, lock, viewersOnly, layout);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());		
	}

	// could be improved by doing some factorization
	public void getBreakoutRoomsList(String jsonMessage) {
		sender.send(MessagingConstants.TO_USERS_CHANNEL, jsonMessage);
	}

	public void createBreakoutRooms(String jsonMessage) {
		sender.send(MessagingConstants.TO_USERS_CHANNEL, jsonMessage);
	}

	public void requestBreakoutJoinURL(String jsonMessage) {
		sender.send(MessagingConstants.TO_USERS_CHANNEL, jsonMessage);
	}

	public void listenInOnBreakout(String jsonMessage) {
		sender.send(MessagingConstants.TO_USERS_CHANNEL, jsonMessage);
	}

	public void endAllBreakoutRooms(String jsonMessage) {
		sender.send(MessagingConstants.TO_USERS_CHANNEL, jsonMessage);
	}

	public void logoutEndMeeting(String meetingId, String userId) {
		LogoutEndMeetingRequestMessage msg = new LogoutEndMeetingRequestMessage(meetingId, userId);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());
	}

	public void activityResponse(String meetingID) {
		ActivityResponseMessage msg = new ActivityResponseMessage(meetingID);
		sender.send(MessagingConstants.TO_MEETING_CHANNEL, msg.toJson());
	}
}
