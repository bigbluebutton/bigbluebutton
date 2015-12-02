package org.bigbluebutton.red5.client;

import java.util.HashMap;
import java.util.Map;

import org.bigbluebutton.common.messages.Constants;
import org.bigbluebutton.common.messages.PatchDocumentReplyMessage;
import org.bigbluebutton.common.messages.GetCurrentDocumentReplyMessage;
import org.bigbluebutton.common.messages.CreateAdditionalNotesReplyMessage;
import org.bigbluebutton.common.messages.DestroyAdditionalNotesReplyMessage;
import org.bigbluebutton.red5.client.messaging.BroadcastClientMessage;
import org.bigbluebutton.red5.client.messaging.ConnectionInvokerService;
import org.bigbluebutton.red5.client.messaging.DirectClientMessage;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class SharedNotesClientMessageSender {
	private ConnectionInvokerService service;

	public SharedNotesClientMessageSender(ConnectionInvokerService service) {
		this.service = service;
	}

	public void handleSharedNotesMessage(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				switch (messageName) {
					case PatchDocumentReplyMessage.PATCH_DOCUMENT_REPLY:
						processPatchDocumentReplyMessage(message);
						break;
					case GetCurrentDocumentReplyMessage.GET_CURRENT_DOCUMENT_REPLY:
						processGetCurrentDocumentReplyMessage(message);
						break;
					case CreateAdditionalNotesReplyMessage.CREATE_ADDITIONAL_NOTES_REPLY:
						processCreateAdditionalNotesReplyMessage(message);
						break;
					case DestroyAdditionalNotesReplyMessage.DESTROY_ADDITIONAL_NOTES_REPLY:
						processDestroyAdditionalNotesReplyMessage(message);
						break;
				}
			}
		}
	}

	private void processPatchDocumentReplyMessage(String json) {
		PatchDocumentReplyMessage msg = PatchDocumentReplyMessage.fromJson(json);
		if (msg != null) {
			Map<String, Object> args = new HashMap<String, Object>();
			args.put("userID", msg.requesterID);
			args.put("noteID", msg.noteID);
			args.put("patch", msg.patch);

			Map<String, Object> message = new HashMap<String, Object>();
			Gson gson = new Gson();
			message.put("msg", gson.toJson(args));

			BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingID, "PatchDocumentCommand", message);
			service.sendMessage(m);
		}
	}

	private void processGetCurrentDocumentReplyMessage(String json) {
		GetCurrentDocumentReplyMessage msg = GetCurrentDocumentReplyMessage.fromJson(json);
		if (msg != null) {
			Map<String, Object> args = new HashMap<String, Object>();
			args.put("notes", msg.notes);

			Map<String, Object> message = new HashMap<String, Object>();
			Gson gson = new Gson();
			message.put("msg", gson.toJson(args));

			DirectClientMessage m = new DirectClientMessage(msg.meetingID, msg.requesterID, "GetCurrentDocumentCommand", message);
			service.sendMessage(m);
		}
	}

	private void processCreateAdditionalNotesReplyMessage(String json) {
		CreateAdditionalNotesReplyMessage msg = CreateAdditionalNotesReplyMessage.fromJson(json);
		if (msg != null) {
			Map<String, Object> args = new HashMap<String, Object>();
			args.put("noteID", msg.noteID);
			args.put("noteName", msg.noteName);

			Map<String, Object> message = new HashMap<String, Object>();
			Gson gson = new Gson();
			message.put("msg", gson.toJson(args));

			BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingID, "CreateAdditionalNotesCommand", message);
			service.sendMessage(m);
		}
	}

	private void processDestroyAdditionalNotesReplyMessage(String json) {
		DestroyAdditionalNotesReplyMessage msg = DestroyAdditionalNotesReplyMessage.fromJson(json);
		if (msg != null) {
			Map<String, Object> args = new HashMap<String, Object>();
			args.put("noteID", msg.noteID);

			Map<String, Object> message = new HashMap<String, Object>();
			Gson gson = new Gson();
			message.put("msg", gson.toJson(args));

			BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingID, "DestroyAdditionalNotesCommand", message);
			service.sendMessage(m);
		}
	}
}
