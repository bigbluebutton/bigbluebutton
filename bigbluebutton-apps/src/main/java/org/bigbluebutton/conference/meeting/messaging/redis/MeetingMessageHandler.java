package org.bigbluebutton.conference.meeting.messaging.redis;

import java.util.HashMap;
import java.util.Map;
import org.bigbluebutton.conference.service.messaging.CreateMeetingMessage;
import org.bigbluebutton.conference.service.messaging.DestroyMeetingMessage;
import org.bigbluebutton.conference.service.messaging.EndMeetingMessage;
import org.bigbluebutton.conference.service.messaging.IMessage;
import org.bigbluebutton.conference.service.messaging.KeepAliveMessage;
import org.bigbluebutton.conference.service.messaging.MessageFromJsonConverter;
import org.bigbluebutton.conference.service.messaging.MessagingConstants;
import org.bigbluebutton.conference.service.messaging.RegisterUserMessage;
import org.bigbluebutton.conference.service.messaging.UserConnectedToGlobalAudio;
import org.bigbluebutton.conference.service.messaging.UserDisconnectedFromGlobalAudio;
import org.bigbluebutton.conference.service.messaging.ValidateAuthTokenMessage;
import org.bigbluebutton.conference.service.messaging.GetAllMeetingsRequest;
import org.bigbluebutton.conference.service.messaging.redis.MessageHandler;
import org.bigbluebutton.core.api.IBigBlueButtonInGW;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;
import com.google.gson.Gson;


public class MeetingMessageHandler implements MessageHandler {
	private static Logger log = Red5LoggerFactory.getLogger(MeetingMessageHandler.class, "bigbluebutton");
	
	private IBigBlueButtonInGW bbbGW;
	
	@Override
	public void handleMessage(String pattern, String channel, String message) {
//		System.out.println("Checking message: " + pattern + " " + channel + " " + message);
		if (channel.equalsIgnoreCase(MessagingConstants.TO_MEETING_CHANNEL)) {
//			System.out.println("Meeting message: " + channel + " " + message);
			IMessage msg = MessageFromJsonConverter.convert(message);
			
			if (msg != null) {
				if (msg instanceof EndMeetingMessage) {
					EndMeetingMessage emm = (EndMeetingMessage) msg;
					log.info("Received end meeting request. Meeting id [{}]", emm.meetingId);
					bbbGW.endMeeting(emm.meetingId);
				} else if (msg instanceof CreateMeetingMessage) {
					CreateMeetingMessage emm = (CreateMeetingMessage) msg;
					log.info("Received create meeting request. Meeting id [{}]", emm.id);
					bbbGW.createMeeting2(emm.id, emm.externalId, emm.name, emm.record, emm.voiceBridge, 
							  emm.duration, emm.autoStartRecording, emm.allowStartStopRecording);
				} else if (msg instanceof RegisterUserMessage) {
					RegisterUserMessage emm = (RegisterUserMessage) msg;
					log.info("Received register user request. Meeting id [{}], userid=[{}], token=[{}]", emm.meetingID, emm.internalUserId, emm.authToken);
					bbbGW.registerUser(emm.meetingID, emm.internalUserId, emm.fullname, emm.role, emm.externUserID, emm.authToken);
				} else if (msg instanceof DestroyMeetingMessage) {
					DestroyMeetingMessage emm = (DestroyMeetingMessage) msg;
					log.info("Received destroy meeting request. Meeting id [{}]", emm.meetingId);
					bbbGW.destroyMeeting(emm.meetingId);
				} else if (msg instanceof ValidateAuthTokenMessage) {
					ValidateAuthTokenMessage emm = (ValidateAuthTokenMessage) msg;
					log.info("Received ValidateAuthTokenMessage token request. Meeting id [{}]", emm.meetingId);
					log.warn("TODO: Need to pass sessionId on ValidateAuthTokenMessage message.");
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
					
					log.info("User connected to global audio: data={}", logStr);
					
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
					
					log.info("User disconnected from global audio: data={}", logStr);
					bbbGW.userDisconnectedFromGlobalAudio(emm.voiceConf, emm.userid, emm.name);
				}
				else if (msg instanceof GetAllMeetingsRequest) {
					GetAllMeetingsRequest emm = (GetAllMeetingsRequest) msg;
					log.info("Received GetAllMeetingsRequest");
					bbbGW.getAllMeetings("no_need_of_a_meeting_id");
				}
			}
		} else if (channel.equalsIgnoreCase(MessagingConstants.TO_SYSTEM_CHANNEL)) {
			IMessage msg = MessageFromJsonConverter.convert(message);
			
			if (msg != null) {
				if (msg instanceof KeepAliveMessage) {
					KeepAliveMessage emm = (KeepAliveMessage) msg;
					log.debug("Received KeepAliveMessage request. Meeting id [{}]", emm.keepAliveId);
					bbbGW.isAliveAudit(emm.keepAliveId);					
				}
			}
		}
	}
	
	public void setBigBlueButtonInGW(IBigBlueButtonInGW bbbGW) {
		this.bbbGW = bbbGW;
	}
	
}
