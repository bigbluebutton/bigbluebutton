package org.bigbluebutton.core.pubsub.receivers;

import java.util.HashMap;
import java.util.Map;

import org.bigbluebutton.common.messages.DestroyMeetingMessage;
import org.bigbluebutton.common.messages.EndMeetingMessage;
import org.bigbluebutton.common.messages.GetAllMeetingsRequest;
import org.bigbluebutton.common.messages.IBigBlueButtonMessage;
import org.bigbluebutton.common.messages.KeepAliveMessage;
import org.bigbluebutton.common.messages.MessageFromJsonConverter;
import org.bigbluebutton.common.messages.MessagingConstants;
import org.bigbluebutton.common.messages.PubSubPingMessage;
import org.bigbluebutton.common.messages.RegisterUserMessage;
import org.bigbluebutton.common.messages.UserConnectedToGlobalAudio;
import org.bigbluebutton.common.messages.UserDisconnectedFromGlobalAudio;
import org.bigbluebutton.common.messages.ValidateAuthTokenMessage;
import org.bigbluebutton.core.api.IBigBlueButtonInGW;
import org.bigbluebutton.messages.BreakoutRoomStarted;
import org.bigbluebutton.messages.CreateMeetingRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class MeetingMessageReceiver implements MessageHandler {
	private static final Logger LOG = LoggerFactory.getLogger(MeetingMessageReceiver.class);
	
	private IBigBlueButtonInGW bbbGW;
	
	public MeetingMessageReceiver(IBigBlueButtonInGW bbbGW) {
		this.bbbGW = bbbGW;
	}
	
	public void handleMessage(String pattern, String channel, String message) {
		if (channel.equalsIgnoreCase(MessagingConstants.TO_MEETING_CHANNEL)) {
			System.out.println("Meeting message: " + channel + " " + message);

			JsonParser parser = new JsonParser();
			JsonObject obj = (JsonObject) parser.parse(message);
			if (obj.has("header") && obj.has("payload")) {
				JsonObject header = (JsonObject) obj.get("header");
				if (header.has("name")) {
					String messageName = header.get("name").getAsString();
					if (CreateMeetingRequest.NAME.equals(messageName)) {
						Gson gson = new Gson();
						CreateMeetingRequest msg = gson.fromJson(message,
								CreateMeetingRequest.class);
						bbbGW.handleBigBlueButtonMessage(msg);
					}
					if(BreakoutRoomStarted.NAME.equals(messageName)) {
						bbbGW.handleJsonMessage(message);
					}
				}
			}

			IBigBlueButtonMessage msg = MessageFromJsonConverter.convert(message);
			
			if (msg != null) {
				if (msg instanceof EndMeetingMessage) {
					EndMeetingMessage emm = (EndMeetingMessage) msg;
					bbbGW.endMeeting(emm.meetingId);
				} else if (msg instanceof RegisterUserMessage) {
					RegisterUserMessage emm = (RegisterUserMessage) msg;
					bbbGW.registerUser(emm.meetingID, emm.internalUserId, emm.fullname, emm.role, emm.externUserID, emm.authToken);
				} else if (msg instanceof DestroyMeetingMessage) {
					DestroyMeetingMessage emm = (DestroyMeetingMessage) msg;
					bbbGW.destroyMeeting(emm.meetingId);
				} else if (msg instanceof ValidateAuthTokenMessage) {
					ValidateAuthTokenMessage emm = (ValidateAuthTokenMessage) msg;
					String sessionId = "tobeimplemented";
					bbbGW.validateAuthToken(emm.meetingId, emm.userId, emm.token, emm.replyTo, sessionId);
				} else if (msg instanceof UserConnectedToGlobalAudio) {
					UserConnectedToGlobalAudio emm = (UserConnectedToGlobalAudio) msg;
					
					Map<String, Object> logData = new HashMap<String, Object>();
					logData.put("voiceConf", emm.voiceConf);
					logData.put("userId", emm.userid);
					logData.put("username", emm.name);
					logData.put("event", "user_connected_to_global_audio");
					logData.put("description", "User connected to global audio.");
					
					Gson gson = new Gson();
					String logStr =  gson.toJson(logData);
					
					//System.out.println("User connected to global audio: data={}", logStr);
					
					bbbGW.userConnectedToGlobalAudio(emm.voiceConf, emm.userid, emm.name);
				} else if (msg instanceof UserDisconnectedFromGlobalAudio) {
					UserDisconnectedFromGlobalAudio emm = (UserDisconnectedFromGlobalAudio) msg;
					
					Map<String, Object> logData = new HashMap<String, Object>();
					logData.put("voiceConf", emm.voiceConf);
					logData.put("userId", emm.userid);
					logData.put("username", emm.name);
					logData.put("event", "user_disconnected_from_global_audio");
					logData.put("description", "User disconnected from global audio.");
					
					Gson gson = new Gson();
					String logStr =  gson.toJson(logData);
					
					//System.out.println("User disconnected from global audio: data={}", logStr);
					bbbGW.userDisconnectedFromGlobalAudio(emm.voiceConf, emm.userid, emm.name);
				}
				else if (msg instanceof GetAllMeetingsRequest) {
					GetAllMeetingsRequest emm = (GetAllMeetingsRequest) msg;
					bbbGW.getAllMeetings("no_need_of_a_meeting_id");
				} else {
					System.out.println("Unknown message: [" + message + "]");
				}
			} else {
				System.out.println("Failed to decode message: [" + message + "]");
			}
		} else if (channel.equalsIgnoreCase(MessagingConstants.TO_SYSTEM_CHANNEL)) {
			JsonParser parser = new JsonParser();
			JsonObject obj = (JsonObject) parser.parse(message);
		
			if (obj.has("header") && obj.has("payload")) {
				JsonObject header = (JsonObject) obj.get("header");
				if (header.has("name")) {
					String messageName = header.get("name").getAsString();
					if (PubSubPingMessage.PUBSUB_PING.equals(messageName)){
						Gson gson = new Gson();
						PubSubPingMessage msg = gson.fromJson(message, PubSubPingMessage.class);
						bbbGW.handleBigBlueButtonMessage(msg);
					} else {
						IBigBlueButtonMessage msg = MessageFromJsonConverter.convert(message);
						
						if (msg != null) {
							if (msg instanceof KeepAliveMessage) {
								KeepAliveMessage emm = (KeepAliveMessage) msg;
								bbbGW.isAliveAudit(emm.keepAliveId);					
							}
						} else {
							System.out.println("Unknown message: [" + message + "]");
						}				
					}
				}	
			}

		}
	}
	
	public void setBigBlueButtonInGW(IBigBlueButtonInGW bbbGW) {
		this.bbbGW = bbbGW;
	}
	
}