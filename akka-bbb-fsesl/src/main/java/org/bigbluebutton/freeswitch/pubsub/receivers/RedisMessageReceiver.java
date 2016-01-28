package org.bigbluebutton.freeswitch.pubsub.receivers;


import org.bigbluebutton.common.messages.EjectAllUsersFromVoiceConfRequestMessage;
import org.bigbluebutton.common.messages.EjectUserFromVoiceConfRequestMessage;
import org.bigbluebutton.common.messages.GetUsersFromVoiceConfRequestMessage;
import org.bigbluebutton.common.messages.MuteUserInVoiceConfRequestMessage;
import org.bigbluebutton.common.messages.StartRecordingVoiceConfRequestMessage;
import org.bigbluebutton.common.messages.StopRecordingVoiceConfRequestMessage;
import org.bigbluebutton.common.messages.TransferUserToVoiceConfRequestMessage;
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
					  case TransferUserToVoiceConfRequestMessage.TRANSFER_USER_TO_VOICE_CONF_REQUEST:
						  processTransferUserToVoiceConfRequestMessage(message);
					  break;
					  case StartRecordingVoiceConfRequestMessage.START_RECORD_VOICE_CONF_REQUEST:
						  processStartRecordingVoiceConfRequestMessage(message);
					  break;
					  case StopRecordingVoiceConfRequestMessage.STOP_RECORD_VOICE_CONF_REQUEST:
						  processStopRecordingVoiceConfRequestMessage(message);
					  break;
					}
				}
			}
		}
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
	
	private void processTransferUserToVoiceConfRequestMessage(String json) {
		TransferUserToVoiceConfRequestMessage msg = TransferUserToVoiceConfRequestMessage
				.fromJson(json);
		fsApp.transferUserToMeeting(msg.voiceConfId, msg.targetVoiceConfId,
				msg.voiceUserId, msg.forward);
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
