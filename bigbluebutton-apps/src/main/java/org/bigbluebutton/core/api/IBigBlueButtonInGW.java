package org.bigbluebutton.core.api;

import java.util.Map;


public interface IBigBlueButtonInGW {

	void isAliveAudit(String aliveID);
	void statusMeetingAudit(String meetingID);
	void endMeeting(String meetingID);
	void endAllMeetings();
	void createMeeting2(String meetingID, String externalMeetingID, String meetingName, boolean recorded, 
			    String voiceBridge, long duration, boolean autoStartRecording,
			    boolean allowStartStopRecording);
	void destroyMeeting(String meetingID);
	void getAllMeetings(String meetingID);
	void lockSettings(String meetingID, Boolean locked, Map<String, Boolean> lockSettigs);
	
	
	// Lock
	void initLockSettings(String meetingID, Map<String, Boolean> settings);
	void sendLockSettings(String meetingID, String userId, Map<String, Boolean> settings);
	void getLockSettings(String meetingId, String userId);
	void lockUser(String meetingId, String requesterID, boolean lock, String internalUserID);
	
	
	// Users
	void validateAuthToken(String meetingId, String userId, String token, String correlationId, String sessionId);
	void registerUser(String roomName, String userid, String username, String role, String externUserID, String authToken);
	void userRaiseHand(String meetingId, String userId);	
	void lowerHand(String meetingId, String userId, String loweredBy);
	void shareWebcam(String meetingId, String userId, String stream);
	void unshareWebcam(String meetingId, String userId);
	void setUserStatus(String meetingID, String userID, String status, Object value);
	void getUsers(String meetingID, String requesterID);
	void userLeft(String meetingID, String userID, String sessionId);
	void userJoin(String meetingID, String userID, String authToken);
	void getCurrentPresenter(String meetingID, String requesterID);
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
	void voiceUserJoined(String meetingId, String userId, String webUserId, String conference, 
								String callerIdNum, String callerIdName,
								Boolean muted, Boolean speaking);
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
	
	// Polling
	void getPolls(String meetingID, String requesterID);
	void createPoll(String meetingID, String requesterID, String msg);
	void updatePoll(String meetingID, String requesterID, String msg);	
	void startPoll(String meetingID, String requesterID, String msg);
	void stopPoll(String meetingID, String requesterID, String msg);
	void removePoll(String meetingID, String requesterID, String msg);
	void respondPoll(String meetingID, String requesterID, String msg);
	void preCreatedPoll(String meetingID, String msg);
	
	// Layout
	void getCurrentLayout(String meetingID, String requesterID);
	void broadcastLayout(String meetingID, String requesterID, String layout);
	void lockLayout(String meetingID, String setById, 
                  boolean lock, boolean viewersOnly,
                  scala.Option<String> layout);

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
	
}
