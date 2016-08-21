package org.bigbluebutton.transcode.pubsub.receivers;

import org.bigbluebutton.transcode.core.api.ITranscodingInGW;

import org.bigbluebutton.common.messages.StartTranscoderRequestMessage;
import org.bigbluebutton.common.messages.UpdateTranscoderRequestMessage;
import org.bigbluebutton.common.messages.StopTranscoderRequestMessage;
import org.bigbluebutton.common.messages.StopMeetingTranscodersMessage;
import org.bigbluebutton.common.messages.StartProbingRequestMessage;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class RedisMessageReceiver {

	public static final String TO_BBB_TRANSCODE_CHANNEL = "bigbluebutton:to-bbb-transcode";
	public static final String TO_BBB_TRANSCODE_PATTERN = TO_BBB_TRANSCODE_CHANNEL + ":*";
	public static final String TO_BBB_TRANSCODE_SYSTEM_CHAN = TO_BBB_TRANSCODE_CHANNEL + ":system";

	private ITranscodingInGW transcodingInGW;

	public RedisMessageReceiver(ITranscodingInGW transcodingInGW) {
		this.transcodingInGW = transcodingInGW;
	}

	public void handleMessage(String pattern, String channel, String message) {
		if (channel.equalsIgnoreCase(TO_BBB_TRANSCODE_SYSTEM_CHAN)) {
			JsonParser parser = new JsonParser();
			JsonObject obj = (JsonObject) parser.parse(message);

			if (obj.has("header") && obj.has("payload")) {
				JsonObject header = (JsonObject) obj.get("header");

				if (header.has("name")) {
					String messageName = header.get("name").getAsString();
					switch (messageName) {
					  case StartTranscoderRequestMessage.START_TRANSCODER_REQUEST:
						processStartTranscoderRequestMessage(message);
					  break;
					  case UpdateTranscoderRequestMessage.UPDATE_TRANSCODER_REQUEST:
						processUpdateTranscoderRequestMessage(message);
					  break;
					  case StopTranscoderRequestMessage.STOP_TRANSCODER_REQUEST:
						processStopTranscoderRequestMessage(message);
					  break;
					  case StopMeetingTranscodersMessage.STOP_MEETING_TRANSCODERS:
						processStopMeetingTranscodersMessage(message);
						break;
					  case StartProbingRequestMessage.START_PROBING_REQUEST:
						processStartProbingRequestMessage(message);
					}
				}
			}
		}
	}

	private void processStartTranscoderRequestMessage(String json) {
		StartTranscoderRequestMessage msg = StartTranscoderRequestMessage.fromJson(json);
		transcodingInGW.startTranscoder(msg.meetingId, msg.transcoderId, msg.params);
	}

	private void processUpdateTranscoderRequestMessage(String json) {
		UpdateTranscoderRequestMessage msg = UpdateTranscoderRequestMessage.fromJson(json);
		transcodingInGW.updateTranscoder(msg.meetingId, msg.transcoderId, msg.params);
	}

	private void processStopTranscoderRequestMessage(String json) {
		StopTranscoderRequestMessage msg = StopTranscoderRequestMessage.fromJson(json);
		transcodingInGW.stopTranscoder(msg.meetingId, msg.transcoderId);
	}

	private void processStopMeetingTranscodersMessage(String json) {
		StopMeetingTranscodersMessage msg = StopMeetingTranscodersMessage.fromJson(json);
		transcodingInGW.stopMeetingTranscoders(msg.meetingId);
	}

	private void processStartProbingRequestMessage(String json) {
		StartProbingRequestMessage msg = StartProbingRequestMessage.fromJson(json);
		transcodingInGW.startProbing(msg.meetingId, msg.transcoderId, msg.params);
	}
}
