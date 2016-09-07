package org.bigbluebutton.red5.client;

import java.util.HashMap;
import java.util.Map;

import org.bigbluebutton.common.messages.Constants;
import org.bigbluebutton.common.messages.EditCaptionHistoryMessage;
import org.bigbluebutton.common.messages.SendCaptionHistoryReplyMessage;
import org.bigbluebutton.common.messages.UpdateCaptionOwnerMessage;
import org.bigbluebutton.red5.client.messaging.BroadcastClientMessage;
import org.bigbluebutton.red5.client.messaging.ConnectionInvokerService;
import org.bigbluebutton.red5.client.messaging.DirectClientMessage;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class CaptionClientMessageSender {
	private ConnectionInvokerService service;
	
	public CaptionClientMessageSender(ConnectionInvokerService service) {
		this.service = service;
	}

	public void handleCaptionMessage(String message) {

		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);

		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				switch (messageName) {
					case SendCaptionHistoryReplyMessage.SEND_CAPTION_HISTORY_REPLY:
						SendCaptionHistoryReplyMessage sch = SendCaptionHistoryReplyMessage.fromJson(message);

						if (sch != null) {
							processSendCaptionHistoryReplyMessage(sch);
						}
						break;
					case UpdateCaptionOwnerMessage.UPDATE_CAPTION_OWNER:
						UpdateCaptionOwnerMessage uco = UpdateCaptionOwnerMessage.fromJson(message);

						if (uco != null) {
							processUpdateCaptionOwnerMessage(uco);
						}
						break;
					case EditCaptionHistoryMessage.EDIT_CAPTION_HISTORY:
						EditCaptionHistoryMessage ech = EditCaptionHistoryMessage.fromJson(message);

						if (ech != null) {
							processEditCaptionHistoryMessage(ech);
						}
						break;
				}
			}
		}
	}

	private void processSendCaptionHistoryReplyMessage(SendCaptionHistoryReplyMessage msg) {
		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(msg.captionHistory));
		
		DirectClientMessage m = new DirectClientMessage(msg.meetingID, msg.requesterID, "sendCaptionHistoryReply", message);
		service.sendMessage(m);
	}

	private void processUpdateCaptionOwnerMessage(UpdateCaptionOwnerMessage msg) {
		Map<String, Object> message = new HashMap<String, Object>();
		message.put(Constants.LOCALE, msg.locale);
		message.put(Constants.LOCALE_CODE, msg.localeCode);
		message.put(Constants.OWNER_ID, msg.ownerID);

		BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingID, "updateCaptionOwner", message);
		service.sendMessage(m);
	}

	private void processEditCaptionHistoryMessage(EditCaptionHistoryMessage msg) {
		Map<String, Object> message = new HashMap<String, Object>();
		message.put(Constants.START_INDEX, msg.startIndex);
		message.put(Constants.END_INDEX, msg.endIndex);
		message.put(Constants.LOCALE, msg.locale);
		message.put(Constants.LOCALE_CODE, msg.localeCode);
		message.put(Constants.TEXT, msg.text);

		BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingID, "editCaptionHistory", message);
		service.sendMessage(m);
	}
}
