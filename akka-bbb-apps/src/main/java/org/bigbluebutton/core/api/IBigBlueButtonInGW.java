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

	// Polling
	void votePoll(String meetingId, String userId, String pollId, Integer questionId, Integer answerId);
	void startPoll(String meetingId, String requesterId, String pollId, String pollType);
	void stopPoll(String meetingId, String userId, String pollId);
	void showPollResult(String meetingId, String requesterId, String pollId, Boolean show);

	// Lock
	void initLockSettings(String meetingID, Map<String, Boolean> settings);
	void sendLockSettings(String meetingID, String userId, Map<String, Boolean> settings);
	void getLockSettings(String meetingId, String userId);
	void lockUser(String meetingId, String requesterID, boolean lock, String internalUserID);

	// Users
	void validateAuthToken(String meetingId, String userId, String token, String correlationId, String sessionId);
	void registerUser(String roomName, String userid, String username, String role, String externUserID, String authToken, String avatarURL);
	void userEmojiStatus(String meetingId, String userId, String emojiStatus);	
	void shareWebcam(String meetingId, String userId, String stream);
	void unshareWebcam(String meetingId, String userId, String stream);
	void setUserStatus(String meetingID, String userID, String status, Object value);
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

	// Presentation
	void clear(String meetingID);
	void removePresentation(String meetingID, String presentationID);
	void getPresentationInfo(String meetingID, String requesterID, String replyTo);
	void sendCursorUpdate(String meetingID, double xPercent, double yPercent);
	void resizeAndMoveSlide(String meetingID, double xOffset, double yOffset, double widthRatio, double heightRatio);
	void gotoSlide(String meetingID, String page);
	void sharePresentation(String meetingID, String presentationID, boolean share);
	void getSlideInfo(String meetingID, String requesterID, String replyTo);

	void sendConversionUpdate(String messageKey, String meetingId, 
            String code, String presId, String presName); 

	void sendPageCountError(String messageKey, String meetingId, 
            String code, String presId, int numberOfPages,
            int maxNumberPages, String presName);

	void sendSlideGenerated(String messageKey, String meetingId, 
            String code, String presId, int numberOfPages,
            int pagesCompleted, String presName);

	void sendConversionCompleted(String messageKey, String meetingId, 
            String code, String presId, int numPages, String presName, String presBaseUrl);

	// Layout
	void getCurrentLayout(String meetingID, String requesterID);
	void broadcastLayout(String meetingID, String requesterID, String layout);
	void lockLayout(String meetingID, String setById, 
                  boolean lock, boolean viewersOnly,
                  String layout);

	// Chat
	void getChatHistory(String meetingID, String requesterID, String replyTo);
	void sendPublicMessage(String meetingID, String requesterID, Map<String, String> message);
	void sendPrivateMessage(String meetingID, String requesterID, Map<String, String> message);

	// Whiteboard
	void sendWhiteboardAnnotation(String meetingID, String requesterID, java.util.Map<String, Object> annotation);	
	void requestWhiteboardAnnotationHistory(String meetingID, String requesterID, String whiteboardId, String replyTo);
	void clearWhiteboard(String meetingID, String requesterID, String whiteboardId);
	void undoWhiteboard(String meetingID, String requesterID, String whiteboardId);
	void enableWhiteboard(String meetingID, String requesterID, Boolean enable);
	void isWhiteboardEnabled(String meetingID, String requesterID, String replyTo);
	
	// Caption
	void sendCaptionHistory(String meetingID, String requesterID);
	void updateCaptionOwner(String meetingID, String locale, String localeCode, String ownerID);
	void editCaptionHistory(String meetingID, String userID, Integer startIndex, Integer endIndex, String locale, String localeCode, String text);

	// DeskShare
	void deskShareStarted(String confId, String callerId, String callerIdName);
	void deskShareStopped(String conferenceName, String callerId, String callerIdName);
	void deskShareRTMPBroadcastStarted(String conferenceName, String streamname, int videoWidth, int videoHeight, String timestamp);
	void deskShareRTMPBroadcastStopped(String conferenceName, String streamname, int videoWidth, int videoHeight, String timestamp);
	void deskShareGetInfoRequest(String meetingId, String requesterId, String replyTo);
}
