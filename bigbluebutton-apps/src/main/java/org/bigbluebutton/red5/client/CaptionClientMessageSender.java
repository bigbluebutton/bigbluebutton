package org.bigbluebutton.red5.client;

import java.util.HashMap;
import java.util.Map;

import org.bigbluebutton.common.messages.Constants;
import org.bigbluebutton.common.messages.NewCaptionLineMessage;
import org.bigbluebutton.common.messages.SendCaptionHistoryReplyMessage;
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
					case NewCaptionLineMessage.NEW_CAPTION_LINE:
						NewCaptionLineMessage ncl = NewCaptionLineMessage.fromJson(message);

						if (ncl != null) {
							processNewCaptionLineMessage(ncl);
						}
						break;
					case SendCaptionHistoryReplyMessage.SEND_CAPTION_HISTORY_REPLY:
						SendCaptionHistoryReplyMessage sch = SendCaptionHistoryReplyMessage.fromJson(message);

						if (sch != null) {
							processSendCaptionHistoryReplyMessage(sch);
						}
						break;
				}
			}
		}
	}

	private void processNewCaptionLineMessage(NewCaptionLineMessage msg) {
		Map<String, Object> message = new HashMap<String, Object>();
		message.put(Constants.LINE_NUMBER, msg.lineNumber);
		message.put(Constants.LOCALE, msg.locale);
		message.put(Constants.START_TIME, msg.startTime);
		message.put(Constants.TEXT, msg.text);

		BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingID, "newCaptionLine", message);
		service.sendMessage(m);
	}

	private void processSendCaptionHistoryReplyMessage(SendCaptionHistoryReplyMessage msg) {
		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(msg.captionHistory));
		
		DirectClientMessage m = new DirectClientMessage(msg.meetingID, msg.requesterID, "sendCaptionHistoryReply", message);
		service.sendMessage(m);
	}
}
