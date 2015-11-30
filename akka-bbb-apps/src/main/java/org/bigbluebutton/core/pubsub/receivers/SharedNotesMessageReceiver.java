
package org.bigbluebutton.core.pubsub.receivers;

import org.bigbluebutton.common.messages.CreateAdditionalNotesRequestMessage;
import org.bigbluebutton.common.messages.DestroyAdditionalNotesRequestMessage;
import org.bigbluebutton.common.messages.GetCurrentDocumentRequestMessage;
import org.bigbluebutton.common.messages.MessagingConstants;
import org.bigbluebutton.common.messages.PatchDocumentRequestMessage;
import org.bigbluebutton.common.messages.RequestAdditionalNotesSetRequestMessage;

import org.bigbluebutton.core.api.IBigBlueButtonInGW;

import com.google.gson.JsonParser;
import com.google.gson.JsonObject;

public class SharedNotesMessageReceiver implements MessageHandler {

	private IBigBlueButtonInGW bbbInGW;
	
	public SharedNotesMessageReceiver(IBigBlueButtonInGW bbbInGW) {
		this.bbbInGW = bbbInGW;
	}

	@Override
	public void handleMessage(String pattern, String channel, String message) {
		if (channel.equalsIgnoreCase(MessagingConstants.TO_SHAREDNOTES_CHANNEL)) {
			JsonParser parser = new JsonParser();
			JsonObject obj = (JsonObject) parser.parse(message);
			if (obj.has("header") && obj.has("payload")) {
				JsonObject header = (JsonObject) obj.get("header");

				if (header.has("name")) {
					String messageName = header.get("name").getAsString();
					switch (messageName) {
						case PatchDocumentRequestMessage.PATCH_DOCUMENT_REQUEST:
							processPatchDocumentRequestMessage(message);
							break;
						case GetCurrentDocumentRequestMessage.GET_CURRENT_DOCUMENT_REQUEST:
							processGetCurrentDocumentRequestMessage(message);
							break;
						case CreateAdditionalNotesRequestMessage.CREATE_ADDITIONAL_NOTES_REQUEST:
							processCreateAdditionalNotesRequestMessage(message);
							break;
						case DestroyAdditionalNotesRequestMessage.DESTROY_ADDITIONAL_NOTES_REQUEST:
							processDestroyAdditionalNotesRequestMessage(message);
							break;
						case RequestAdditionalNotesSetRequestMessage.REQUEST_ADDITIONAL_NOTES_SET_REQUEST:
							processRequestAdditionalNotesSetRequestMessage(message);
							break;
					}
				}
			}
		}
	}

	private void processPatchDocumentRequestMessage(String json) {
		PatchDocumentRequestMessage msg = PatchDocumentRequestMessage.fromJson(json);
		if (msg != null) {
			bbbInGW.patchDocument(msg.meetingID, msg.requesterID, msg.noteID, msg.patch);
		}
	}

	private void processGetCurrentDocumentRequestMessage(String json) {
		GetCurrentDocumentRequestMessage msg = GetCurrentDocumentRequestMessage.fromJson(json);
		if (msg != null) {
			bbbInGW.getCurrentDocument(msg.meetingID, msg.requesterID);
		}
	}

	private void processCreateAdditionalNotesRequestMessage(String json) {
		CreateAdditionalNotesRequestMessage msg = CreateAdditionalNotesRequestMessage.fromJson(json);
		if (msg != null) {
			bbbInGW.createAdditionalNotes(msg.meetingID, msg.requesterID, msg.noteName);
		}
	}

	private void processDestroyAdditionalNotesRequestMessage(String json) {
		DestroyAdditionalNotesRequestMessage msg = DestroyAdditionalNotesRequestMessage.fromJson(json);
		if (msg != null) {
			bbbInGW.destroyAdditionalNotes(msg.meetingID, msg.requesterID, msg.noteID);
		}
	}

	private void processRequestAdditionalNotesSetRequestMessage(String json) {
		RequestAdditionalNotesSetRequestMessage msg = RequestAdditionalNotesSetRequestMessage.fromJson(json);
		if (msg != null) {
			bbbInGW.requestAdditionalNotesSet(msg.meetingID, msg.requesterID, msg.additionalNotesSetSize);
		}
	}
}
