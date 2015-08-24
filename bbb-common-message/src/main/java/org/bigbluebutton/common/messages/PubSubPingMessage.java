package org.bigbluebutton.common.messages;

import org.bigbluebutton.common.messages.payload.PubSubPingMessagePayload;

public class PubSubPingMessage implements IBigBlueButtonMessage {

	public static final String PUBSUB_PING = "BbbPubSubPingMessage";
	
	public MessageHeader header;		
	public PubSubPingMessagePayload payload;
}
