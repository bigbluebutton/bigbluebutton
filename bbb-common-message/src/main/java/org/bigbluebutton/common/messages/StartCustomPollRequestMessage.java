package org.bigbluebutton.common.messages;

public class StartCustomPollRequestMessage implements IBigBlueButtonMessage {

	public static final String START_CUSTOM_POLL_REQUEST = "start_custom_poll_request_message";
	
	public MessageHeader header;		
	public StartCustomPollRequestMessagePayload payload;
}
