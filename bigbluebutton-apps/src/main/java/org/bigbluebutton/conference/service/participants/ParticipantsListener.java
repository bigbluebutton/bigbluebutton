
package org.bigbluebutton.conference.service.participants;

import org.bigbluebutton.conference.BigBlueButtonApplication;
import org.bigbluebutton.conference.service.messaging.redis.MessageHandler;
import org.bigbluebutton.core.api.IBigBlueButtonInGW;
import org.bigbluebutton.red5.pub.messages.AssignPresenterRequestMessage;
import org.bigbluebutton.red5.pub.messages.MessagingConstants;
import org.bigbluebutton.red5.sub.messages.EjectUserFromMeetingRequestMessage;
import org.bigbluebutton.red5.sub.messages.GetRecordingStatusRequestMessage;
import org.bigbluebutton.red5.sub.messages.SetRecordingStatusRequestMessage;
import org.bigbluebutton.red5.sub.messages.SetUserStatusRequestMessage;
import org.bigbluebutton.red5.sub.messages.UserLeavingMessage;
import org.bigbluebutton.red5.sub.messages.UserLoweredHandMessage;
import org.bigbluebutton.red5.sub.messages.UserRaisedHandMessage;
import org.bigbluebutton.red5.sub.messages.UserShareWebcamRequestMessage;
import org.bigbluebutton.red5.sub.messages.UserUnshareWebcamRequestMessage;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

import com.google.gson.JsonParser;
import com.google.gson.JsonObject;

public class ParticipantsListener implements MessageHandler{
  private static Logger log = Red5LoggerFactory.getLogger(BigBlueButtonApplication.class, "bigbluebutton");
  
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
				JsonObject payload = (JsonObject) obj.get("payload");
				
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
}
