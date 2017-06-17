package org.bigbluebutton.red5.client;

import java.util.HashMap;
import java.util.Map;
import org.bigbluebutton.common.messages.CursorPositionUpdatedMessage;
import org.bigbluebutton.red5.client.messaging.BroadcastClientMessage;
import org.bigbluebutton.red5.client.messaging.IConnectionInvokerService;
import org.bigbluebutton.red5.client.messaging.DirectClientMessage;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class WhiteboardClientMessageSender {
	private IConnectionInvokerService service;
	
	public WhiteboardClientMessageSender(IConnectionInvokerService service) {
		this.service = service;
	}
	
	public void handleWhiteboardMessage(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
	
				switch (messageName) {
					case CursorPositionUpdatedMessage.CURSOR_POSITION_UPDATED:
						CursorPositionUpdatedMessage cpum = CursorPositionUpdatedMessage.fromJson(message);
						if (cpum != null) {
							processCursorPositionUpdatedMessage(cpum);
						}
						break;
				}
			}
		}
	}

	
	private void processCursorPositionUpdatedMessage(CursorPositionUpdatedMessage msg) {
		Map<String, Object> args = new HashMap<String, Object>();
		args.put("requesterId", msg.requesterId);
		args.put("xPercent", msg.xPercent);
		args.put("yPercent", msg.yPercent);

		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));

		BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "WhiteboardCursorPositionUpdatedCommand", message);
		service.sendMessage(m);
	}
}
