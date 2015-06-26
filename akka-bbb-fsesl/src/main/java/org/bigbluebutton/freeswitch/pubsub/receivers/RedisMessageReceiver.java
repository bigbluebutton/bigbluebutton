package org.bigbluebutton.freeswitch.pubsub.receivers;


import org.bigbluebutton.common.messages.DeskShareStopRecordingEventMessage;
import org.bigbluebutton.common.messages.EjectAllUsersFromVoiceConfRequestMessage;
import org.bigbluebutton.common.messages.EjectUserFromVoiceConfRequestMessage;
import org.bigbluebutton.common.messages.GetUsersFromVoiceConfRequestMessage;
import org.bigbluebutton.common.messages.MuteUserInVoiceConfRequestMessage;
import org.bigbluebutton.common.messages.StartRecordingVoiceConfRequestMessage;
import org.bigbluebutton.common.messages.StopRecordingVoiceConfRequestMessage;
import org.bigbluebutton.common.messages.DeskShareStartRecordingEventMessage;
import org.bigbluebutton.freeswitch.voice.freeswitch.FreeswitchApplication;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class RedisMessageReceiver {

	public static final String TO_VOICE_CONF_CHANNEL = "bigbluebutton:to-voice-conf";	
	public static final String TO_VOICE_CONF_PATTERN = TO_VOICE_CONF_CHANNEL + ":*";
	public static final String TO_VOICE_CONF_SYSTEM_CHAN = TO_VOICE_CONF_CHANNEL + ":system";
	
	private final FreeswitchApplication fsApp;
	
	public RedisMessageReceiver(FreeswitchApplication fsApp) {
		this.fsApp = fsApp;
	}
	
	public void handleMessage(String pattern, String channel, String message) {
		System.out.println("************* Received: \n" + message + "\n*************************");
		
		if (channel.equalsIgnoreCase(TO_VOICE_CONF_SYSTEM_CHAN)) {
			JsonParser parser = new JsonParser();
			JsonObject obj = (JsonObject) parser.parse(message);

			if (obj.has("header") && obj.has("payload")) {
				JsonObject header = (JsonObject) obj.get("header");

				if (header.has("name")) {
					String messageName = header.get("name").getAsString();
					switch (messageName) {
					  case EjectAllUsersFromVoiceConfRequestMessage.EJECT_ALL_VOICE_USERS_REQUEST:
						  processEjectAllVoiceUsersRequestMessage(message);
						  break;
					  case EjectUserFromVoiceConfRequestMessage.EJECT_VOICE_USER_REQUEST:
						  processEjectVoiceUserRequestMessage(message);
						  break;
					  case GetUsersFromVoiceConfRequestMessage.GET_VOICE_USERS_REQUEST:
						  processGetVoiceUsersRequestMessage(message);
					  break;
					  case MuteUserInVoiceConfRequestMessage.MUTE_VOICE_USER_REQUEST:
						  processMuteVoiceUserRequestMessage(message);
					  break;
					  case StartRecordingVoiceConfRequestMessage.START_RECORD_VOICE_CONF_REQUEST:
						  processStartRecordingVoiceConfRequestMessage(message);
					  break;
					  case StopRecordingVoiceConfRequestMessage.STOP_RECORD_VOICE_CONF_REQUEST:
						  processStopRecordingVoiceConfRequestMessage(message);
					  break;
					  case DeskShareStartRecordingEventMessage.DESKSHARE_START_RECORDING_MESSAGE:
						  processDeskShareStartRecordingEventMessage(message);
					  break;
					  case DeskShareStopRecordingEventMessage.DESKSHARE_STOP_RECORDING_MESSAGE:
						  processDeskShareStopRecordingEventMessage(message);
					  break;
					}
				}
			}
		}
	}

	private void processDeskShareStartRecordingEventMessage(String json) {
		System.out.println("^^^FS^processDeskShareStartRecordingEventMessage");
		DeskShareStartRecordingEventMessage msg = DeskShareStartRecordingEventMessage.fromJson(json);
		fsApp.deskShareRecording(msg.conferenceName, msg.filename, true);
	}

	private void processDeskShareStopRecordingEventMessage(String json) {
		System.out.println("^^^FS^processDeskShareStopRecordingEventMessage");
		DeskShareStopRecordingEventMessage msg = DeskShareStopRecordingEventMessage.fromJson(json);
		fsApp.deskShareRecording(msg.conferenceName, msg.filename, false);
	}

	private void processEjectAllVoiceUsersRequestMessage(String json) {
		EjectAllUsersFromVoiceConfRequestMessage msg = EjectAllUsersFromVoiceConfRequestMessage.fromJson(json);
		fsApp.ejectAll(msg.voiceConfId);
	}
	
	private void processEjectVoiceUserRequestMessage(String json) {
		EjectUserFromVoiceConfRequestMessage msg = EjectUserFromVoiceConfRequestMessage.fromJson(json);
		fsApp.eject(msg.voiceConfId, msg.voiceUserId);
	}
	
	private void processGetVoiceUsersRequestMessage(String json) {
		GetUsersFromVoiceConfRequestMessage msg = GetUsersFromVoiceConfRequestMessage.fromJson(json);
		fsApp.getAllUsers(msg.voiceConfId);
	}
	
	private void processMuteVoiceUserRequestMessage(String json) {
		MuteUserInVoiceConfRequestMessage msg = MuteUserInVoiceConfRequestMessage.fromJson(json);
		fsApp.muteUser(msg.voiceConfId, msg.voiceUserId, msg.mute);
	}
	
	private void processStartRecordingVoiceConfRequestMessage(String json) {
		StartRecordingVoiceConfRequestMessage msg = StartRecordingVoiceConfRequestMessage.fromJson(json);
		fsApp.startRecording(msg.voiceConfId, msg.meetingId);
	}
	
	private void processStopRecordingVoiceConfRequestMessage(String json) {
		StopRecordingVoiceConfRequestMessage msg = StopRecordingVoiceConfRequestMessage.fromJson(json);
		fsApp.stopRecording(msg.voiceConfId, msg.meetingId, msg.recordStream);
	}
}
