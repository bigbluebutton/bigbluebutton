package org.bigbluebutton.common.converters;

import org.bigbluebutton.common.messages.MessageHeader;
import org.bigbluebutton.common.messages.PubSubPongMessage;
import org.bigbluebutton.common.messages.payload.PubSubPingMessagePayload;

import com.google.gson.Gson;

public class ToJsonEncoder {

	public String encodePubSubPingMessage(String system, Long timestamp) {
		PubSubPongMessage m = new PubSubPongMessage();
		MessageHeader header = new MessageHeader();
		PubSubPingMessagePayload payload = new PubSubPingMessagePayload();
		header.name = PubSubPongMessage.PUBSUB_PONG;
		header.timestamp = System.nanoTime();
		payload.system = system;
		payload.timestamp = timestamp;
		
		m.header = header;
		m.payload = payload;
		Gson gson = new Gson();
		return gson.toJson(m);
		
	}
}
