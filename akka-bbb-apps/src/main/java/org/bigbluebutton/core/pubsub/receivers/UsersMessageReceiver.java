
package org.bigbluebutton.core.pubsub.receivers;

import org.bigbluebutton.common.messages.*;
import org.bigbluebutton.core.api.IBigBlueButtonInGW;
import org.bigbluebutton.messages.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class UsersMessageReceiver implements MessageHandler{
	private static final Logger LOG = LoggerFactory.getLogger(UsersMessageReceiver.class);

	private IBigBlueButtonInGW bbbInGW;
	
	public UsersMessageReceiver(IBigBlueButtonInGW bbbInGW) {
		this.bbbInGW = bbbInGW;
	}

	@Override
	public void handleMessage(String pattern, String channel, String message) {
		if (channel.equalsIgnoreCase(MessagingConstants.TO_USERS_CHANNEL)) {
			JsonParser parser = new JsonParser();
			JsonObject obj = (JsonObject) parser.parse(message);
			if (obj.has("header") && obj.has("payload")) {
				JsonObject header = (JsonObject) obj.get("header");

				if (header.has("name")) {
					String messageName = header.get("name").getAsString();
					switch (messageName) {
					  case UserLeavingMessage.USER_LEAVING:
						  processUserLeavingMessage(message);
						  break;
					  case AllowUserToShareDesktopRequest.NAME:
						  processAllowUserToShareDesktopRequest(message);
						  break;
					  case AssignPresenterRequestMessage.ASSIGN_PRESENTER_REQUEST:
						  processAssignPresenterRequestMessage(message);
						  break;
					  case UserEmojiStatusMessage.USER_EMOJI_STATUS:
						  processUserEmojiStatusMessage(message);
						  break;
					  case EjectUserFromMeetingRequestMessage.EJECT_USER_FROM_MEETING_REQUEST:
						  processEjectUserFromMeetingRequestMessage(message);
						  break;
					  case UserShareWebcamRequestMessage.USER_SHARE_WEBCAM_REQUEST:
						  processUserShareWebcamRequestMessage(message);
						  break;
					  case UserUnshareWebcamRequestMessage.USER_UNSHARE_WEBCAM_REQUEST:
						  processUserUnshareWebcamRequestMessage(message);
						  break;
					  case SetUserStatusRequestMessage.SET_USER_STATUS_REQUEST:
						  processSetUserStatusRequestMessage(message);
						  break;
					  case SetRecordingStatusRequestMessage.SET_RECORDING_STATUS_REQUEST:
						  processSetRecordingStatusRequestMessage(message);
						  break; 
					  case GetRecordingStatusRequestMessage.GET_RECORDING_STATUS_REQUEST:
						  processGetRecordingStatusRequestMessage(message);
						  break;
					  case GetUsersRequestMessage.GET_USERS_REQUEST:
						  processGetUsersRequestMessage(message);
						  break;
					  case InitPermissionsSettingMessage.INIT_PERMISSIONS_SETTING:
						  processInitPermissionsSettingMessage(message);
						  break;
					  case InitAudioSettingsMessage.INIT_AUDIO_SETTING:
						  processInitAudioSettingsMessage(message);
						  break;
					  case BroadcastLayoutRequestMessage.BROADCAST_LAYOUT_REQUEST:
						  processBroadcastLayoutRequestMessage(message);
						  break;
					  case LockLayoutRequestMessage.LOCK_LAYOUT_REQUEST:
						  processLockLayoutRequestMessage(message);
						  break;
					  case GetCurrentLayoutRequestMessage.GET_CURRENT_LAYOUT_REQUEST:
						  processGetCurrentLayoutRequestMessage(message);
						  break;
					  case MuteAllExceptPresenterRequestMessage.MUTE_ALL_EXCEPT_PRESENTER_REQUEST:
						  processMuteAllExceptPresenterRequestMessage(message);
						  break;
					  case MuteAllRequestMessage.MUTE_ALL_REQUEST:
						  processMuteAllRequestMessage(message);
						  break;
					  case IsMeetingMutedRequestMessage.IS_MEETING_MUTED_REQUEST:
						  processIsMeetingMutedRequestMessage(message);
						  break;
					  case MuteUserRequestMessage.MUTE_USER_REQUEST:
						  processMuteUserRequestMessage(message);
						  break;
					  case LockMuteUserRequestMessage.LOCK_MUTE_USER_REQUEST:
						  processLockMuteUserRequestMessage(message);
						  break;
					  case EjectUserFromVoiceRequestMessage.EJECT_USER_FROM_VOICE_REQUEST:
						  processEjectUserFromVoiceRequestMessage(message);
						  break;
					  case GetBreakoutRoomsList.NAME:
						  bbbInGW.handleJsonMessage(message);
						  break;
					  case CreateBreakoutRoomsRequest.NAME:
						  bbbInGW.handleJsonMessage(message);
						  break;
					  case ListenInOnBreakout.NAME:
						  bbbInGW.handleJsonMessage(message);
						  break;
					  case RequestBreakoutJoinURL.NAME:
						  bbbInGW.handleJsonMessage(message);
						  break;
					  case EndAllBreakoutRoomsRequest.NAME:
						  bbbInGW.handleJsonMessage(message);
						  break;
					}
				}
			}
		} else if (channel.equalsIgnoreCase(MessagingConstants.FROM_VOICE_CONF_SYSTEM_CHAN)) {
			//System.out.println("Voice message: " + channel + " " + message);
			JsonParser parser = new JsonParser();
			JsonObject obj = (JsonObject) parser.parse(message);
			if (obj.has("header") && obj.has("payload")) {
				JsonObject header = (JsonObject) obj.get("header");

				if (header.has("name")) {
					String messageName = header.get("name").getAsString();
					switch (messageName) {
					  case UserJoinedVoiceConfMessage.USER_JOINED_VOICE_CONF:
						  processUserJoinedVoiceConfMessage(message);
						  break;	
					  case UserLeftVoiceConfMessage.USER_LEFT_VOICE_CONF:
						  processUserLeftVoiceConfMessage(message);
						  break;
					  case UserLockedInVoiceConfMessage.USER_LOCKED_IN_VOICE_CONF:
						  processUserLockedInVoiceConfMessage(message);
						  break;
					  case UserMutedInVoiceConfMessage.USER_MUTED_IN_VOICE_CONF:
						  processUserMutedInVoiceConfMessage(message);
						  break;
					  case UserTalkingInVoiceConfMessage.USER_TALKING_IN_VOICE_CONF:
						  processUserTalkingInVoiceConfMessage(message);
						  break;
					  case VoiceConfRecordingStartedMessage.VOICE_CONF_RECORDING_STARTED:
						  processVoiceConfRecordingStartedMessage(message);
						  break;
					}
				}
			}
		}
	}
	
	private void processUserJoinedVoiceConfMessage(String json) {
		UserJoinedVoiceConfMessage msg = UserJoinedVoiceConfMessage.fromJson(json);
		if (msg != null) {
			bbbInGW.voiceUserJoined(msg.voiceConfId, msg.voiceUserId, msg.userId, msg.callerIdName, msg.callerIdNum, msg.muted, msg.avatarURL, msg.talking);
		}
	}

	private void processUserLeftVoiceConfMessage(String json) {
		UserLeftVoiceConfMessage msg = UserLeftVoiceConfMessage.fromJson(json);
		if (msg != null) {
			bbbInGW.voiceUserLeft(msg.voiceConfId, msg.voiceUserId);
		}
	}

	private void processUserLockedInVoiceConfMessage(String json) {
		UserLockedInVoiceConfMessage msg = UserLockedInVoiceConfMessage.fromJson(json);
		if (msg != null) {
			bbbInGW.voiceUserLocked(msg.voiceConfId, msg.voiceUserId, msg.locked);
		}
	}
	
	private void processUserMutedInVoiceConfMessage(String json) {
		UserMutedInVoiceConfMessage msg = UserMutedInVoiceConfMessage.fromJson(json);
		if (msg != null) {
			bbbInGW.voiceUserMuted(msg.voiceConfId, msg.voiceUserId, msg.muted);
		}
	}

	private void processUserTalkingInVoiceConfMessage(String json) {
		UserTalkingInVoiceConfMessage msg = UserTalkingInVoiceConfMessage.fromJson(json);
		if (msg != null) {
			bbbInGW.voiceUserTalking(msg.voiceConfId, msg.voiceUserId, msg.talking);
		}
	}
	
	private void processVoiceConfRecordingStartedMessage(String json) {
		VoiceConfRecordingStartedMessage msg = VoiceConfRecordingStartedMessage.fromJson(json);
		if (msg != null) {
			bbbInGW.voiceRecording(msg.voiceConfId, msg.recordStream, msg.timestamp, msg.recording);
		}
	}
	
	private void processUserLeavingMessage(String message) {
		  UserLeavingMessage ulm = UserLeavingMessage.fromJson(message);
		  if (ulm != null) {
			  bbbInGW.userLeft(ulm.meetingId, ulm.userId, ulm.meetingId);
		  }		
	}

    private void processAllowUserToShareDesktopRequest(String message) {
        AllowUserToShareDesktopRequest msg = AllowUserToShareDesktopRequest.fromJson(message);
        if (msg != null) {
            bbbInGW.checkIfAllowedToShareDesktop(msg.meetingId, msg.userId);
        }
    }

	private void processAssignPresenterRequestMessage(String message) {
		AssignPresenterRequestMessage apm = AssignPresenterRequestMessage.fromJson(message);
		if (apm != null) {
			bbbInGW.assignPresenter(apm.meetingId, apm.newPresenterId, apm.newPresenterName, apm.assignedBy);
		}
	}
	
	private void processUserEmojiStatusMessage(String message) {
		UserEmojiStatusMessage uesm = UserEmojiStatusMessage.fromJson(message);
		if (uesm != null) {
			bbbInGW.userEmojiStatus(uesm.meetingId, uesm.userId, uesm.emojiStatus);
		}
	}
	
	private void processEjectUserFromMeetingRequestMessage(String message) {
		EjectUserFromMeetingRequestMessage eufm = EjectUserFromMeetingRequestMessage.fromJson(message);
		if (eufm != null) {
			bbbInGW.ejectUserFromMeeting(eufm.meetingId, eufm.userId, eufm.ejectedBy);
		}
	}
	
	private void processUserShareWebcamRequestMessage(String message) {
		UserShareWebcamRequestMessage msg = UserShareWebcamRequestMessage.fromJson(message);
		if (msg != null) {
			bbbInGW.shareWebcam(msg.meetingId, msg.userId, msg.stream);
		}
	}
	
	private void processUserUnshareWebcamRequestMessage(String message) {
		UserUnshareWebcamRequestMessage msg = UserUnshareWebcamRequestMessage.fromJson(message);
		if (msg != null) {
			bbbInGW.unshareWebcam(msg.meetingId, msg.userId, msg.stream);
		}
	}
	
	private void processSetUserStatusRequestMessage(String message) {
		SetUserStatusRequestMessage msg = SetUserStatusRequestMessage.fromJson(message);
		if (msg != null) {
			bbbInGW.setUserStatus(msg.meetingId, msg.userId, msg.status, msg.value);
		}
	}
	
	private void processSetRecordingStatusRequestMessage(String message) {
		SetRecordingStatusRequestMessage msg = SetRecordingStatusRequestMessage.fromJson(message);
		if (msg != null) {
			bbbInGW.setRecordingStatus(msg.meetingId, msg.userId, msg.recording);
		}
	}
	
	private void processGetRecordingStatusRequestMessage(String message) {
		GetRecordingStatusRequestMessage msg = GetRecordingStatusRequestMessage.fromJson(message);
		if (msg != null) {
			bbbInGW.getRecordingStatus(msg.meetingId, msg.userId);
		}
	}
	
	private void processGetUsersRequestMessage(String message) {
		GetUsersRequestMessage msg = GetUsersRequestMessage.fromJson(message);
		if (msg != null) {
			bbbInGW.getUsers(msg.meetingId, msg.requesterId);
		}
	}
	
	private void processInitPermissionsSettingMessage(String message) {
		InitPermissionsSettingMessage msg = InitPermissionsSettingMessage.fromJson(message);
		if (msg != null) {
			bbbInGW.initLockSettings(msg.meetingId, msg.permissions);
		}
	}
	
	private void processInitAudioSettingsMessage(String message) {
		InitAudioSettingsMessage msg = InitAudioSettingsMessage.fromJson(message);
		if (msg != null) {
			bbbInGW.initAudioSettings(msg.meetingId, msg.userId, msg.muted);
		}
	}
	
	private void processBroadcastLayoutRequestMessage(String message) {
		BroadcastLayoutRequestMessage msg = BroadcastLayoutRequestMessage.fromJson(message);
		if (msg != null) {
			bbbInGW.broadcastLayout(msg.meetingId, msg.userId, msg.layout);
		}
	}
	
	private void processLockLayoutRequestMessage(String message) {
		LockLayoutRequestMessage msg = LockLayoutRequestMessage.fromJson(message);
		if (msg != null) {
			bbbInGW.lockLayout(msg.meetingId, msg.userId, msg.lock, msg.viewersOnly, msg.layout);
		}
	}
	
	private void processGetCurrentLayoutRequestMessage(String message) {
		GetCurrentLayoutRequestMessage msg = GetCurrentLayoutRequestMessage.fromJson(message);
		if (msg != null) {
			bbbInGW.getCurrentLayout(msg.meetingId, msg.userId);
		}
	}
	
	private void processMuteAllExceptPresenterRequestMessage(String message) {
		MuteAllExceptPresenterRequestMessage msg = MuteAllExceptPresenterRequestMessage.fromJson(message);
		if (msg != null) {
			bbbInGW.muteAllExceptPresenter(msg.meetingId, msg.requesterId, msg.mute);
		}
	}
	
	private void processMuteAllRequestMessage(String message) {
		MuteAllRequestMessage msg = MuteAllRequestMessage.fromJson(message);
		if (msg != null) {
			bbbInGW.muteAllUsers(msg.meetingId, msg.requesterId, msg.mute);
		}
	}
	
	private void processIsMeetingMutedRequestMessage(String message) {
		IsMeetingMutedRequestMessage msg = IsMeetingMutedRequestMessage.fromJson(message);
		if (msg != null) {
			bbbInGW.isMeetingMuted(msg.meetingId, msg.requesterId);
		}		
	}
	
	private void processMuteUserRequestMessage(String message) {
		MuteUserRequestMessage msg = MuteUserRequestMessage.fromJson(message);
		if (msg != null) {
			bbbInGW.muteUser(msg.meetingId, msg.requesterId, msg.userId, msg.mute);
		}		
	}
	
	private void processLockMuteUserRequestMessage(String message) {
		LockMuteUserRequestMessage msg = LockMuteUserRequestMessage.fromJson(message);
		if (msg != null) {
			bbbInGW.lockMuteUser(msg.meetingId, msg.requesterId, msg.userId, msg.lock);
		}		
	}
	
	private void processEjectUserFromVoiceRequestMessage(String message) {
		EjectUserFromVoiceRequestMessage msg = EjectUserFromVoiceRequestMessage.fromJson(message);
		if (msg != null) {
			bbbInGW.ejectUserFromVoice(msg.meetingId, msg.userId, msg.requesterId);
		}
	}
}
