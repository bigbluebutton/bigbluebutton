package org.bigbluebutton.core.pubsub.receivers;

import org.bigbluebutton.common.messages.MessagingConstants;
import org.bigbluebutton.common.messages.EditCaptionHistoryMessage;
import org.bigbluebutton.common.messages.SendCaptionHistoryRequestMessage;
import org.bigbluebutton.common.messages.UpdateCaptionOwnerMessage;

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
					if (SendCaptionHistoryRequestMessage.SEND_CAPTION_HISTORY_REQUEST.equals(messageName)){
						SendCaptionHistoryRequestMessage msg = SendCaptionHistoryRequestMessage.fromJson(message);
						bbbGW.sendCaptionHistory(msg.meetingID, msg.requesterID);
					} else if (UpdateCaptionOwnerMessage.UPDATE_CAPTION_OWNER.equals(messageName)) {
						UpdateCaptionOwnerMessage msg = UpdateCaptionOwnerMessage.fromJson(message);
						bbbGW.updateCaptionOwner(msg.meetingID, msg.locale, msg.localeCode, msg.ownerID);
					} else if (EditCaptionHistoryMessage.EDIT_CAPTION_HISTORY.equals(messageName)) {
						EditCaptionHistoryMessage msg = EditCaptionHistoryMessage.fromJson(message);
						bbbGW.editCaptionHistory(msg.meetingID, msg.userID, msg.startIndex, msg.endIndex, msg.locale, msg.localeCode, msg.text);
					} 
				}
			}
		}
	}
}
