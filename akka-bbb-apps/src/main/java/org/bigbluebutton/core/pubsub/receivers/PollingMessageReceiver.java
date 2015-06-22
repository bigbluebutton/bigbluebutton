package org.bigbluebutton.core.pubsub.receivers;

import org.bigbluebutton.common.messages.*;

import com.google.gson.JsonParser;
import com.google.gson.JsonObject;

import org.bigbluebutton.core.api.IBigBlueButtonInGW;

public class PollingMessageReceiver implements MessageHandler{

	private IBigBlueButtonInGW bbbGW;
	
	public PollingMessageReceiver(IBigBlueButtonInGW bbbGW) {
		this.bbbGW = bbbGW;
	}

	@Override
	public void handleMessage(String pattern, String channel, String message) {
		if (channel.equalsIgnoreCase(MessagingConstants.TO_POLLING_CHANNEL)) {
			JsonParser parser = new JsonParser();
			JsonObject obj = (JsonObject) parser.parse(message);
			if (obj.has("header") && obj.has("payload")) {
				JsonObject header = (JsonObject) obj.get("header");
				if (header.has("name")) {
					String messageName = header.get("name").getAsString();
					if (VotePollUserRequestMessage.VOTE_POLL_REQUEST.equals(messageName)) {
						VotePollUserRequestMessage msg = VotePollUserRequestMessage.fromJson(message);
						bbbGW.votePoll(msg.meetingId, msg.userId, msg.pollId, msg.questionId, msg.answerId);
					} else if (StartPollRequestMessage.START_POLL_REQUEST.equals(messageName)){
						StartPollRequestMessage msg = StartPollRequestMessage.fromJson(message);
						bbbGW.startPoll(msg.meetingId, msg.requesterId, msg.pollId, msg.pollType);
					} else if (StopPollRequestMessage.STOP_POLL_REQUEST.equals(messageName)){
						StopPollRequestMessage msg = StopPollRequestMessage.fromJson(message);
						bbbGW.stopPoll(msg.meetingId, msg.requesterId, msg.pollId);
					} else if (ShowPollResultRequestMessage.SHOW_POLL_RESULT_REQUEST.equals(messageName)){
						ShowPollResultRequestMessage msg = ShowPollResultRequestMessage.fromJson(message);
						bbbGW.showPollResult(msg.meetingId, msg.requesterId, msg.pollId, msg.show);
					}
				}
			}
		}
	}
}
