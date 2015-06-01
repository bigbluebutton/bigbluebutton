package org.bigbluebutton.freeswitch.pubsub.receivers;

import org.bigbluebutton.freeswitch.pubsub.messages.EjectAllUsersFromVoiceConfRequestMessage;
import org.bigbluebutton.freeswitch.pubsub.messages.EjectUserFromVoiceConfRequestMessage;
import org.bigbluebutton.freeswitch.pubsub.messages.GetUsersFromVoiceConfRequestMessage;
import org.bigbluebutton.freeswitch.pubsub.messages.MuteUserInVoiceConfRequestMessage;
import org.bigbluebutton.freeswitch.pubsub.messages.RecordVoiceConfRequestMessage;
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
					  case RecordVoiceConfRequestMessage.RECORD_VOICE_CONF_REQUEST:
						  processRecordVoiceConfRequestMessage(message);
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
	}
	
	private void processGetVoiceUsersRequestMessage(String json) {
		GetUsersFromVoiceConfRequestMessage msg = GetUsersFromVoiceConfRequestMessage.fromJson(json);
	}
	
	private void processMuteVoiceUserRequestMessage(String json) {
		MuteUserInVoiceConfRequestMessage msg = MuteUserInVoiceConfRequestMessage.fromJson(json);
	}
	
	private void processRecordVoiceConfRequestMessage(String json) {
		RecordVoiceConfRequestMessage msg = RecordVoiceConfRequestMessage.fromJson(json);
	}
}
