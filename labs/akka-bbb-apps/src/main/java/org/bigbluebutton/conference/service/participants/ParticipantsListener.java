
package org.bigbluebutton.conference.service.participants;

import org.bigbluebutton.common.messages.AssignPresenterRequestMessage;
import org.bigbluebutton.common.messages.BroadcastLayoutRequestMessage;
import org.bigbluebutton.common.messages.EjectUserFromMeetingRequestMessage;
import org.bigbluebutton.common.messages.EjectUserFromVoiceRequestMessage;
import org.bigbluebutton.common.messages.GetCurrentLayoutRequestMessage;
import org.bigbluebutton.common.messages.GetRecordingStatusRequestMessage;
import org.bigbluebutton.common.messages.GetUsersRequestMessage;
import org.bigbluebutton.common.messages.InitAudioSettingsMessage;
import org.bigbluebutton.common.messages.InitPermissionsSettingMessage;
import org.bigbluebutton.common.messages.IsMeetingMutedRequestMessage;
import org.bigbluebutton.common.messages.LockLayoutRequestMessage;
import org.bigbluebutton.common.messages.LockMuteUserRequestMessage;
import org.bigbluebutton.common.messages.MessagingConstants;
import org.bigbluebutton.common.messages.MuteAllExceptPresenterRequestMessage;
import org.bigbluebutton.common.messages.MuteAllRequestMessage;
import org.bigbluebutton.common.messages.MuteUserRequestMessage;
import org.bigbluebutton.common.messages.SetRecordingStatusRequestMessage;
import org.bigbluebutton.common.messages.SetUserStatusRequestMessage;
import org.bigbluebutton.common.messages.UserLeavingMessage;
import org.bigbluebutton.common.messages.UserLoweredHandMessage;
import org.bigbluebutton.common.messages.UserRaisedHandMessage;
import org.bigbluebutton.common.messages.UserShareWebcamRequestMessage;
import org.bigbluebutton.common.messages.UserUnshareWebcamRequestMessage;
import org.bigbluebutton.core.pubsub.redis.MessageHandler;
import org.bigbluebutton.core.api.IBigBlueButtonInGW;
import com.google.gson.JsonParser;
import com.google.gson.JsonObject;

public class ParticipantsListener implements MessageHandler{

	private IBigBlueButtonInGW bbbInGW;
	
	public void setBigBlueButtonInGW(IBigBlueButtonInGW bbbInGW) {
		this.bbbInGW = bbbInGW;
	}

	@Override
	public void handleMessage(String pattern, String channel, String message) {
		if (channel.equalsIgnoreCase(MessagingConstants.TO_USERS_CHANNEL)) {
			System.out.println("Users message: " + channel + " " + message);
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
					  case AssignPresenterRequestMessage.ASSIGN_PRESENTER_REQUEST:
						  processAssignPresenterRequestMessage(message);
						  break;
					  case UserRaisedHandMessage.USER_RAISED_HAND:
						  processUserRaisedHandMessage(message);
						  break;
					  case UserLoweredHandMessage.USER_LOWERED_HAND:
						  processUserLoweredHandMessage(message);
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
						  
					}
				}
			}
		}
	}
	
	private void processUserLeavingMessage(String message) {
		  UserLeavingMessage ulm = UserLeavingMessage.fromJson(message);
		  if (ulm != null) {
			  bbbInGW.userLeft(ulm.meetingId, ulm.userId, ulm.meetingId);
		  }		
	}
	
	private void processAssignPresenterRequestMessage(String message) {
		AssignPresenterRequestMessage apm = AssignPresenterRequestMessage.fromJson(message);
		if (apm != null) {
			bbbInGW.assignPresenter(apm.meetingId, apm.newPresenterId, apm.newPresenterName, apm.assignedBy);
		}
	}
	
	private void processUserRaisedHandMessage(String message) {
		UserRaisedHandMessage urhm = UserRaisedHandMessage.fromJson(message);
		if (urhm != null) {
			bbbInGW.userRaiseHand(urhm.meetingId, urhm.userId);;
		}
	}
	
	private void processUserLoweredHandMessage(String message) {
		UserLoweredHandMessage ulhm = UserLoweredHandMessage.fromJson(message);
		if (ulhm != null) {
			bbbInGW.lowerHand(ulhm.meetingId, ulhm.userId, ulhm.loweredBy);
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
