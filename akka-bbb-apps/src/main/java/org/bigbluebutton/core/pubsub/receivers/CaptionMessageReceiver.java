package org.bigbluebutton.core.pubsub.receivers;

import org.bigbluebutton.common.messages.MessagingConstants;
import org.bigbluebutton.common.messages.CurrentCaptionLineMessage;
import org.bigbluebutton.common.messages.NewCaptionLineMessage;
import org.bigbluebutton.common.messages.SendCaptionHistoryRequestMessage;

import com.google.gson.JsonParser;
import com.google.gson.JsonObject;

import org.bigbluebutton.core.api.IBigBlueButtonInGW;

public class CaptionMessageReceiver implements MessageHandler{

	private IBigBlueButtonInGW bbbGW;
	
	public CaptionMessageReceiver(IBigBlueButtonInGW bbbGW) {
		this.bbbGW = bbbGW;
	}

	@Override
	public void handleMessage(String pattern, String channel, String message) {
		if (channel.equalsIgnoreCase(MessagingConstants.TO_CAPTION_CHANNEL)) {
			JsonParser parser = new JsonParser();
			JsonObject obj = (JsonObject) parser.parse(message);
			if (obj.has("header") && obj.has("payload")) {
				JsonObject header = (JsonObject) obj.get("header");
				if (header.has("name")) {
					String messageName = header.get("name").getAsString();
					if (NewCaptionLineMessage.NEW_CAPTION_LINE.equals(messageName)) {
						NewCaptionLineMessage msg = NewCaptionLineMessage.fromJson(message);
						bbbGW.newCaptionLine(msg.meetingID, msg.lineNumber, msg.locale, msg.startTime, msg.text);
					} else if (SendCaptionHistoryRequestMessage.SEND_CAPTION_HISTORY_REQUEST.equals(messageName)){
						SendCaptionHistoryRequestMessage msg = SendCaptionHistoryRequestMessage.fromJson(message);
						bbbGW.sendCaptionHistory(msg.meetingID, msg.requesterID);
					} else if (CurrentCaptionLineMessage.CURRENT_CAPTION_LINE.equals(messageName)) {
						CurrentCaptionLineMessage msg = CurrentCaptionLineMessage.fromJson(message);
						bbbGW.currentCaptionLine(msg.meetingID, msg.locale, msg.text);
					}
				}
			}
		}
	}
}
