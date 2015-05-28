package org.bigbluebutton.core.api;

import java.util.Map;

import org.bigbluebutton.common.messages.AssignPresenterRequestMessage;
import org.bigbluebutton.common.messages.BroadcastLayoutRequestMessage;
import org.bigbluebutton.common.messages.ClearWhiteboardRequestMessage;
import org.bigbluebutton.common.messages.EjectUserFromMeetingRequestMessage;
import org.bigbluebutton.common.messages.EjectUserFromVoiceRequestMessage;
import org.bigbluebutton.common.messages.EnableWhiteboardRequestMessage;
import org.bigbluebutton.common.messages.GetChatHistoryRequestMessage;
import org.bigbluebutton.common.messages.GetCurrentLayoutRequestMessage;
import org.bigbluebutton.common.messages.GetLockSettingsMessage;
import org.bigbluebutton.common.messages.GetPresentationInfoMessage;
import org.bigbluebutton.common.messages.GetRecordingStatusRequestMessage;
import org.bigbluebutton.common.messages.GetSlideInfoMessage;
import org.bigbluebutton.common.messages.GetUsersRequestMessage;
import org.bigbluebutton.common.messages.GoToSlideMessage;
import org.bigbluebutton.common.messages.InitAudioSettingsMessage;
import org.bigbluebutton.common.messages.InitPermissionsSettingMessage;
import org.bigbluebutton.common.messages.IsMeetingMutedRequestMessage;
import org.bigbluebutton.common.messages.IsWhiteboardEnabledRequestMessage;
import org.bigbluebutton.common.messages.LockLayoutRequestMessage;
import org.bigbluebutton.common.messages.LockMuteUserRequestMessage;
import org.bigbluebutton.common.messages.LockUserMessage;
import org.bigbluebutton.common.messages.MessagingConstants;
import org.bigbluebutton.common.messages.MuteAllExceptPresenterRequestMessage;
import org.bigbluebutton.common.messages.MuteAllRequestMessage;
import org.bigbluebutton.common.messages.MuteUserRequestMessage;
import org.bigbluebutton.common.messages.RemovePresentationMessage;
import org.bigbluebutton.common.messages.RequestWhiteboardAnnotationHistoryRequestMessage;
import org.bigbluebutton.common.messages.ResizeAndMoveSlideMessage;
import org.bigbluebutton.common.messages.SendConversionCompletedMessage;
import org.bigbluebutton.common.messages.SendConversionUpdateMessage;
import org.bigbluebutton.common.messages.SendCursorUpdateMessage;
import org.bigbluebutton.common.messages.SendLockSettingsMessage;
import org.bigbluebutton.common.messages.SendPageCountErrorMessage;
import org.bigbluebutton.common.messages.SendPrivateChatMessage;
import org.bigbluebutton.common.messages.SendPublicChatMessage;
import org.bigbluebutton.common.messages.SendSlideGeneratedMessage;
import org.bigbluebutton.common.messages.SendWhiteboardAnnotationRequestMessage;
import org.bigbluebutton.common.messages.SetRecordingStatusRequestMessage;
import org.bigbluebutton.common.messages.SetUserStatusRequestMessage;
import org.bigbluebutton.common.messages.SharePresentationMessage;
import org.bigbluebutton.common.messages.UserLeavingMessage;
import org.bigbluebutton.common.messages.UserLoweredHandMessage;
import org.bigbluebutton.common.messages.UserRaisedHandMessage;
import org.bigbluebutton.common.messages.UserShareWebcamRequestMessage;
import org.bigbluebutton.common.messages.UserUnshareWebcamRequestMessage;
import org.bigbluebutton.common.messages.ValidateAuthTokenMessage;
import org.bigbluebutton.red5.pubsub.redis.MessageSender;

public class Red5BBBInGw implements IBigBlueButtonInGW {

	private MessageSender sender;
	
	public void setMessageSender(MessageSender sender) {
		this.sender = sender;
	}
	
	@Override
	public void isAliveAudit(String aliveID) {
		// TODO Auto-generated method stub

	}

	@Override
	public void statusMeetingAudit(String meetingID) {
		// TODO Auto-generated method stub

	}

	@Override
	public void endMeeting(String meetingID) {
		// TODO Auto-generated method stub

	}

	@Override
	public void endAllMeetings() {
		// TODO Auto-generated method stub

	}

	@Override
	public void createMeeting2(String meetingID, String externalMeetingID,
			String meetingName, boolean recorded, String voiceBridge,
			long duration, boolean autoStartRecording,
			boolean allowStartStopRecording, String moderatorPass,
			String viewerPass, long createTime, String createDate) {
		// TODO Auto-generated method stub

	}

	@Override
	public void destroyMeeting(String meetingID) {
		// TODO Auto-generated method stub

	}

	@Override
	public void getAllMeetings(String meetingID) {
		// TODO Auto-generated method stub

	}

	@Override
	public void lockSettings(String meetingID, Boolean locked,
			Map<String, Boolean> lockSettigs) {
		// TODO Auto-generated method stub

	}

	@Override
	public void initLockSettings(String meetingID, Map<String, Boolean> permissions) {
		InitPermissionsSettingMessage msg = new InitPermissionsSettingMessage(meetingID, permissions);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());
	}

	@Override
	public void sendLockSettings(String meetingID, String userId,
			Map<String, Boolean> settings) {
		SendLockSettingsMessage msg = new SendLockSettingsMessage(meetingID, userId, settings);

		System.out.println("~~~sendLockSettings in Red5BBBInGw");
		sender.send(MessagingConstants.TO_MEETING_CHANNEL, msg.toJson());
	}

	@Override
	public void getLockSettings(String meetingId, String userId) {
		GetLockSettingsMessage msg = new GetLockSettingsMessage(meetingId, userId);

		System.out.println("~~~GetLockSettings in Red5BBBInGw");
		sender.send(MessagingConstants.TO_MEETING_CHANNEL, msg.toJson());
	}

	@Override
	public void lockUser(String meetingId, String requesterID, boolean lock,
			String internalUserID) {
		LockUserMessage msg = new LockUserMessage(meetingId, requesterID, lock, internalUserID);

		System.out.println("~~~LockUser in Red5BBBInGw");
		sender.send(MessagingConstants.TO_MEETING_CHANNEL, msg.toJson());
	}

	@Override
	public void validateAuthToken(String meetingId, String userId,
			String token, String correlationId, String sessionId) {
		ValidateAuthTokenMessage msg = new ValidateAuthTokenMessage(meetingId, userId, token, correlationId, sessionId);
		sender.send(MessagingConstants.TO_MEETING_CHANNEL, msg.toJson());
	}

	@Override
	public void registerUser(String roomName, String userid, String username,
			String role, String externUserID, String authToken) {
		// TODO Auto-generated method stub

	}

	@Override
	public void userRaiseHand(String meetingId, String userId) {
		UserRaisedHandMessage msg = new UserRaisedHandMessage(meetingId, userId, true);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());
	}

	@Override
	public void lowerHand(String meetingId, String userId, String loweredBy) {
		UserLoweredHandMessage msg = new UserLoweredHandMessage(meetingId, userId, false, loweredBy);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());
	}

	@Override
	public void shareWebcam(String meetingId, String userId, String stream) {
		UserShareWebcamRequestMessage msg = new UserShareWebcamRequestMessage(meetingId, userId, stream);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());
	}

	@Override
	public void unshareWebcam(String meetingId, String userId, String stream) {
		UserUnshareWebcamRequestMessage msg = new UserUnshareWebcamRequestMessage(meetingId, userId, stream);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());
	}

	@Override
	public void setUserStatus(String meetingId, String userId, String status, Object value) {
		SetUserStatusRequestMessage msg = new SetUserStatusRequestMessage(meetingId, userId, status, value.toString());
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());
	}

	@Override
	public void getUsers(String meetingId, String requesterId) {
		GetUsersRequestMessage msg = new GetUsersRequestMessage(meetingId, requesterId);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());
	}

	@Override
	public void userLeft(String meetingId, String userId, String sessionId) {
		UserLeavingMessage msg = new UserLeavingMessage(meetingId, userId);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());
	}

	@Override
	public void userJoin(String meetingID, String userID, String authToken) {
		// TODO Auto-generated method stub

	}

	@Override
	public void getCurrentPresenter(String meetingID, String requesterID) {
		// TODO Auto-generated method stub

	}

	@Override
	public void assignPresenter(String meetingId, String newPresenterID,
			String newPresenterName, String assignedBy) {
		AssignPresenterRequestMessage msg = new AssignPresenterRequestMessage(meetingId, newPresenterID, newPresenterName, assignedBy);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());
	}

	@Override
	public void setRecordingStatus(String meetingId, String userId,
			Boolean recording) {
		SetRecordingStatusRequestMessage msg = new SetRecordingStatusRequestMessage(meetingId, userId, recording);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());
	}

	@Override
	public void getRecordingStatus(String meetingId, String userId) {
		GetRecordingStatusRequestMessage msg = new GetRecordingStatusRequestMessage(meetingId, userId);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());		
	}

	@Override
	public void userConnectedToGlobalAudio(String voiceConf, String userid,
			String name) {
		// TODO Auto-generated method stub

	}

	@Override
	public void userDisconnectedFromGlobalAudio(String voiceConf,
			String userid, String name) {
		// TODO Auto-generated method stub

	}

	@Override
	public void initAudioSettings(String meetingID, String requesterID,
			Boolean muted) {
		InitAudioSettingsMessage msg = new InitAudioSettingsMessage(meetingID, requesterID, muted);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());	
	}

	@Override
	public void muteAllExceptPresenter(String meetingID, String requesterID,
			Boolean mute) {
		MuteAllExceptPresenterRequestMessage msg = new MuteAllExceptPresenterRequestMessage(meetingID, requesterID, mute);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());	
	}

	@Override
	public void muteAllUsers(String meetingID, String requesterID, Boolean mute) {
		MuteAllRequestMessage msg = new MuteAllRequestMessage(meetingID, requesterID, mute);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());	
	}

	@Override
	public void isMeetingMuted(String meetingID, String requesterID) {
		IsMeetingMutedRequestMessage msg = new IsMeetingMutedRequestMessage(meetingID, requesterID);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());	
	}

	@Override
	public void muteUser(String meetingID, String requesterID, String userID,
			Boolean mute) {
		MuteUserRequestMessage msg = new MuteUserRequestMessage(meetingID, requesterID, userID, mute);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());	

	}

	@Override
	public void lockMuteUser(String meetingID, String requesterID,
			String userID, Boolean lock) {
		LockMuteUserRequestMessage msg = new LockMuteUserRequestMessage(meetingID, requesterID, userID, lock);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());	
	}

	@Override
	public void ejectUserFromVoice(String meetingID, String userId,
			String ejectedBy) {
		EjectUserFromVoiceRequestMessage msg = new EjectUserFromVoiceRequestMessage(meetingID, ejectedBy, userId);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());	

	}

	@Override
	public void ejectUserFromMeeting(String meetingId, String userId,
			String ejectedBy) {
		EjectUserFromMeetingRequestMessage msg = new EjectUserFromMeetingRequestMessage(meetingId, userId, ejectedBy);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());
	}

	@Override
	public void voiceUserJoined(String meetingId, String userId,
			String webUserId, String conference, String callerIdNum,
			String callerIdName, Boolean muted, Boolean speaking) {
		// TODO Auto-generated method stub

	}

	@Override
	public void voiceUserLeft(String meetingId, String userId) {
		// TODO Auto-generated method stub

	}

	@Override
	public void voiceUserLocked(String meetingId, String userId, Boolean locked) {
		// TODO Auto-generated method stub

	}

	@Override
	public void voiceUserMuted(String meetingId, String userId, Boolean muted) {
		// TODO Auto-generated method stub

	}

	@Override
	public void voiceUserTalking(String meetingId, String userId,
			Boolean talking) {
		// TODO Auto-generated method stub

	}

	@Override
	public void voiceRecording(String meetingId, String recordingFile,
			String timestamp, Boolean recording) {
		// TODO Auto-generated method stub

	}

	@Override
	public void clear(String meetingID) {
		// TODO Auto-generated method stub

	}

	@Override
	public void removePresentation(String meetingID, String presentationID) {
		RemovePresentationMessage msg = new RemovePresentationMessage(meetingID, presentationID);
		sender.send(MessagingConstants.TO_PRESENTATION_CHANNEL, msg.toJson());
	}

	@Override
	public void getPresentationInfo(String meetingID, String requesterID,
			String replyTo) {
		GetPresentationInfoMessage msg = new GetPresentationInfoMessage(meetingID,
				requesterID, replyTo);
		sender.send(MessagingConstants.TO_PRESENTATION_CHANNEL, msg.toJson());

	}

	@Override
	public void sendCursorUpdate(String meetingID, double xPercent,
			double yPercent) {
		SendCursorUpdateMessage msg = new SendCursorUpdateMessage(meetingID,
				xPercent, yPercent);

		sender.send(MessagingConstants.TO_PRESENTATION_CHANNEL, msg.toJson());
	}

	@Override
	public void resizeAndMoveSlide(String meetingID, double xOffset,
			double yOffset, double widthRatio, double heightRatio) {

		ResizeAndMoveSlideMessage msg = new ResizeAndMoveSlideMessage(meetingID,
				xOffset, yOffset, widthRatio, heightRatio);
		sender.send(MessagingConstants.TO_PRESENTATION_CHANNEL, msg.toJson());
	}

	@Override
	public void gotoSlide(String meetingID, String page) {
		GoToSlideMessage msg = new GoToSlideMessage(meetingID, page);
		sender.send(MessagingConstants.TO_PRESENTATION_CHANNEL, msg.toJson());
	}

	@Override
	public void sharePresentation(String meetingID, String presentationID,
			boolean share) {
		SharePresentationMessage msg = new SharePresentationMessage(meetingID, presentationID, share);
		sender.send(MessagingConstants.TO_PRESENTATION_CHANNEL, msg.toJson());
	}

	@Override
	public void getSlideInfo(String meetingID, String requesterID,
			String replyTo) {
		GetSlideInfoMessage msg = new GetSlideInfoMessage(meetingID, requesterID,
				replyTo);
		sender.send(MessagingConstants.TO_PRESENTATION_CHANNEL, msg.toJson());
	}

	@Override
	public void sendConversionUpdate(String messageKey, String meetingId,
			String code, String presId, String presName) {
		SendConversionUpdateMessage msg = new SendConversionUpdateMessage(messageKey, meetingId,
				code, presId, presName);
		sender.send(MessagingConstants.TO_PRESENTATION_CHANNEL, msg.toJson());
	}

	@Override
	public void sendPageCountError(String messageKey, String meetingId,
			String code, String presId, int numberOfPages, int maxNumberPages,
			String presName) {

		SendPageCountErrorMessage msg = new SendPageCountErrorMessage(messageKey, meetingId,
				code, presId, numberOfPages, maxNumberPages, presName);
		sender.send(MessagingConstants.TO_PRESENTATION_CHANNEL, msg.toJson());
	}

	@Override
	public void sendSlideGenerated(String messageKey, String meetingId,
			String code, String presId, int numberOfPages, int pagesCompleted,
			String presName) {
		SendSlideGeneratedMessage msg = new SendSlideGeneratedMessage(messageKey, meetingId,
				code, presId, numberOfPages, pagesCompleted, presName);
		sender.send(MessagingConstants.TO_PRESENTATION_CHANNEL, msg.toJson());
	}

	@Override
	public void sendConversionCompleted(String messageKey, String meetingId,
			String code, String presId, int numPages, String presName,
			String presBaseUrl) {
		SendConversionCompletedMessage msg = new SendConversionCompletedMessage(messageKey, meetingId,
				code, presId, numPages, presName, presBaseUrl);
		sender.send(MessagingConstants.TO_PRESENTATION_CHANNEL, msg.toJson());
	}

	@Override
	public void getPolls(String meetingID, String requesterID) {
		// TODO Auto-generated method stub

	}

	@Override
	public void createPoll(String meetingID, String requesterID, String msg) {
		// TODO Auto-generated method stub

	}

	@Override
	public void updatePoll(String meetingID, String requesterID, String msg) {
		// TODO Auto-generated method stub

	}

	@Override
	public void startPoll(String meetingID, String requesterID, String msg) {
		// TODO Auto-generated method stub

	}

	@Override
	public void stopPoll(String meetingID, String requesterID, String msg) {
		// TODO Auto-generated method stub

	}

	@Override
	public void removePoll(String meetingID, String requesterID, String msg) {
		// TODO Auto-generated method stub

	}

	@Override
	public void respondPoll(String meetingID, String requesterID, String msg) {
		// TODO Auto-generated method stub

	}

	@Override
	public void preCreatedPoll(String meetingID, String msg) {
		// TODO Auto-generated method stub

	}

	@Override
	public void getCurrentLayout(String meetingID, String requesterID) {
		GetCurrentLayoutRequestMessage msg = new GetCurrentLayoutRequestMessage(meetingID, requesterID);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());
	}

	@Override
	public void broadcastLayout(String meetingID, String requesterID,
			String layout) {
		BroadcastLayoutRequestMessage msg = new BroadcastLayoutRequestMessage(meetingID, requesterID, layout);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());
	}

	@Override
	public void getChatHistory(String meetingID, String requesterID,
			String replyTo) {
		GetChatHistoryRequestMessage msg = new GetChatHistoryRequestMessage(meetingID, requesterID, replyTo);
		sender.send(MessagingConstants.TO_CHAT_CHANNEL, msg.toJson());
	}

	@Override
	public void sendPublicMessage(String meetingID, String requesterID,
			Map<String, String> message) {
		SendPublicChatMessage msg = new SendPublicChatMessage(meetingID, requesterID, message);
		sender.send(MessagingConstants.TO_CHAT_CHANNEL, msg.toJson());
	}

	@Override
	public void sendPrivateMessage(String meetingID, String requesterID,
			Map<String, String> message) {
		SendPrivateChatMessage msg = new SendPrivateChatMessage(meetingID, requesterID, message);
		sender.send(MessagingConstants.TO_CHAT_CHANNEL, msg.toJson());
	}

	@Override
	public void sendWhiteboardAnnotation(String meetingID, String requesterID,
			Map<String, Object> annotation) {
		SendWhiteboardAnnotationRequestMessage msg = new SendWhiteboardAnnotationRequestMessage(meetingID, requesterID, annotation);
		sender.send(MessagingConstants.TO_WHITEBOARD_CHANNEL, msg.toJson());
	}

	@Override
	public void requestWhiteboardAnnotationHistory(String meetingID,
			String requesterID, String whiteboardId, String replyTo) {
		RequestWhiteboardAnnotationHistoryRequestMessage msg = new RequestWhiteboardAnnotationHistoryRequestMessage(meetingID, requesterID, whiteboardId, replyTo);
		sender.send(MessagingConstants.TO_WHITEBOARD_CHANNEL, msg.toJson());

	}

	@Override
	public void clearWhiteboard(String meetingID, String requesterID,
			String whiteboardId) {
		ClearWhiteboardRequestMessage msg = new ClearWhiteboardRequestMessage(meetingID, requesterID, whiteboardId);
		sender.send(MessagingConstants.TO_WHITEBOARD_CHANNEL, msg.toJson());

	}

	@Override
	public void undoWhiteboard(String meetingID, String requesterID,
			String whiteboardId) {
		org.bigbluebutton.common.messages.UndoWhiteboardRequest msg = new org.bigbluebutton.common.messages.UndoWhiteboardRequest(meetingID, requesterID, whiteboardId);
		sender.send(MessagingConstants.TO_WHITEBOARD_CHANNEL, msg.toJson());
	}

	@Override
	public void enableWhiteboard(String meetingID, String requesterID,
			Boolean enable) {
		EnableWhiteboardRequestMessage msg = new EnableWhiteboardRequestMessage(meetingID, requesterID, enable);
		sender.send(MessagingConstants.TO_WHITEBOARD_CHANNEL, msg.toJson());
	}

	@Override
	public void isWhiteboardEnabled(String meetingID, String requesterID,
			String replyTo) {
		IsWhiteboardEnabledRequestMessage msg = new IsWhiteboardEnabledRequestMessage(meetingID, requesterID, replyTo);
		sender.send(MessagingConstants.TO_WHITEBOARD_CHANNEL, msg.toJson());

	}

	@Override
	public void lockLayout(String meetingID, String setById, boolean lock,
			boolean viewersOnly, String layout) {
		LockLayoutRequestMessage msg = new LockLayoutRequestMessage(meetingID, setById, lock, viewersOnly, layout);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());		
	}

}
