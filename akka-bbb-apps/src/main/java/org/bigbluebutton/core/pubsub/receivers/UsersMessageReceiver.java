
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
					  case ChangeUserRoleMessage.CHANGE_USER_ROLE:
						  processChangeUserRoleMessage(message);
						  break;
					  case GetGuestPolicyMessage.GET_GUEST_POLICY:
						  processGetGuestPolicyMessage(message);
						  break;
					  case SetGuestPolicyMessage.SET_GUEST_POLICY:
						  processSetGuestPolicyMessage(message);
						  break;
					  case RespondToGuestMessage.RESPOND_TO_GUEST:
						  processRespondToGuestMessage(message);
						  break;
					  case LogoutEndMeetingRequestMessage.LOGOUT_END_MEETING_REQUEST_MESSAGE:
						  processLogoutEndMeetingRequestMessage(message);
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

	private void processChangeUserRoleMessage(String message) {
		ChangeUserRoleMessage msg = ChangeUserRoleMessage.fromJson(message);
		if (msg != null) {
			bbbInGW.setUserRole(msg.meetingId, msg.userId, msg.role);
		}
	}

	private void processGetGuestPolicyMessage(String message) {
		GetGuestPolicyMessage msg = GetGuestPolicyMessage.fromJson(message);
		if (msg != null) {
			bbbInGW.getGuestPolicy(msg.meetingId, msg.requesterId);
		}
	}

	private void processSetGuestPolicyMessage(String message) {
		SetGuestPolicyMessage msg = SetGuestPolicyMessage.fromJson(message);
		if (msg != null) {
			bbbInGW.setGuestPolicy(msg.meetingId, msg.guestPolicy, msg.setBy);
		}
	}

	private void processRespondToGuestMessage(String message) {
		RespondToGuestMessage msg = RespondToGuestMessage.fromJson(message);
		if (msg != null) {
			bbbInGW.responseToGuest(msg.meetingId, msg.userId, msg.response, msg.requesterId);
		}
	}

	private void processLogoutEndMeetingRequestMessage(String message) {
		LogoutEndMeetingRequestMessage lemm = LogoutEndMeetingRequestMessage.fromJson(message);
		if (lemm != null) {
			bbbInGW.logoutEndMeeting(lemm.meetingId, lemm.userId);
		}
	}
}
