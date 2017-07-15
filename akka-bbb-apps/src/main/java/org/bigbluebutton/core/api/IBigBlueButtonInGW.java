package org.bigbluebutton.core.api;

import java.util.Map;
import org.bigbluebutton.common.messages.*;

public interface IBigBlueButtonInGW {

	void handleJsonMessage(String json);
	void handleBigBlueButtonMessage(IBigBlueButtonMessage message);

	void isAliveAudit(String aliveID);
	void statusMeetingAudit(String meetingID);
	void endMeeting(String meetingId);
	void endAllMeetings();

	void destroyMeeting(String meetingID);
	void getAllMeetings(String meetingID);
	void lockSettings(String meetingID, Boolean locked, Map<String, Boolean> lockSettigs);
	void activityResponse(String meetingID);

	// Lock
	void initLockSettings(String meetingID, Map<String, Boolean> settings);
	void sendLockSettings(String meetingID, String userId, Map<String, Boolean> settings);
	void getLockSettings(String meetingId, String userId);
	void lockUser(String meetingId, String requesterID, boolean lock, String internalUserID);

	// Users
	void validateAuthToken(String meetingId, String userId, String token, String correlationId, String sessionId);
	void registerUser(String roomName, String userid, String username, String role, String externUserID,
					  String authToken, String avatarURL, Boolean guest, Boolean authed);
	void userEmojiStatus(String meetingId, String userId, String emojiStatus);	
	void shareWebcam(String meetingId, String userId, String stream);
	void unshareWebcam(String meetingId, String userId, String stream);
	void setUserStatus(String meetingID, String userID, String status, Object value);
	void setUserRole(String meetingID, String userID, String role);
	void getUsers(String meetingID, String requesterID);
	void userLeft(String meetingID, String userID, String sessionId);
	void userJoin(String meetingID, String userID, String authToken);
	void getCurrentPresenter(String meetingID, String requesterID);
    void checkIfAllowedToShareDesktop(String meetingID, String userID);
	void assignPresenter(String meetingID, String newPresenterID, String newPresenterName, String assignedBy);
	void setRecordingStatus(String meetingId, String userId, Boolean recording);
	void getRecordingStatus(String meetingId, String userId);
	void userConnectedToGlobalAudio(String voiceConf, String userid, String name);
	void userDisconnectedFromGlobalAudio(String voiceConf, String userid, String name);
	void getGuestPolicy(String meetingID, String userID);
	void setGuestPolicy(String meetingID, String guestPolicy, String setBy);
	void responseToGuest(String meetingID, String userID, Boolean response, String requesterID);
	void logoutEndMeeting(String meetingID, String userID);

	// Voice
	void initAudioSettings(String meetingID, String requesterID, Boolean muted);
	void muteAllExceptPresenter(String meetingID, String requesterID, Boolean mute);
	void muteAllUsers(String meetingID, String requesterID, Boolean mute);
	void isMeetingMuted(String meetingID, String requesterID);
	void muteUser(String meetingID, String requesterID, String userID, Boolean mute);
	void lockMuteUser(String meetingID, String requesterID, String userID, Boolean lock);
	void ejectUserFromVoice(String meetingID, String userId, String ejectedBy);
	void ejectUserFromMeeting(String meetingId, String userId, String ejectedBy);
	void voiceUserJoined(String voiceConfId, String voiceUserId, String userId, String callerIdName, 
								String callerIdNum, Boolean muted, String avatarURL, Boolean talking);
	void voiceUserLeft(String meetingId, String userId);
	void voiceUserLocked(String meetingId, String userId, Boolean locked);
	void voiceUserMuted(String meetingId, String userId, Boolean muted);
	void voiceUserTalking(String meetingId, String userId, Boolean talking);
	void voiceRecording(String meetingId, String recordingFile, 
			            String timestamp, Boolean recording);

	// DeskShare
	void deskShareStarted(String confId, String callerId, String callerIdName);
	void deskShareStopped(String conferenceName, String callerId, String callerIdName);
	void deskShareRTMPBroadcastStarted(String conferenceName, String streamname, int videoWidth, int videoHeight, String timestamp);
	void deskShareRTMPBroadcastStopped(String conferenceName, String streamname, int videoWidth, int videoHeight, String timestamp);
	void deskShareGetInfoRequest(String meetingId, String requesterId, String replyTo);
}
