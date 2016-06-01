package org.bigbluebutton.common.messages;

import java.util.ArrayList;

import org.bigbluebutton.common.messages.payload.StartCustomPollRequestMessagePayload;
import org.junit.*;

import com.google.gson.Gson;

public class StartCustomPollRequestMessageTest {

	@Test
	public void testStartCustomPollRequestMessage() {
		StartCustomPollRequestMessage msg = new StartCustomPollRequestMessage();
		MessageHeader header = new MessageHeader();
		header.name = "start_custom_poll";
		header.timestamp = 7574118L;
		header.version = "0.0.1";
		
		StartCustomPollRequestMessagePayload payload = new StartCustomPollRequestMessagePayload();
		payload.pollType = "custom";
		payload.pollId = "bar";
		payload.requesterId = "me";
		
		ArrayList<String> answers = new ArrayList<String>();
		answers.add("Red");
		answers.add("Green");
		answers.add("Blue");
		
		payload.answers = answers;
		
		msg.header = header;
		msg.payload = payload;
		
		Gson gson = new Gson();
		String json = gson.toJson(msg);
		System.out.println(json);
		
		StartCustomPollRequestMessage rxMsg = gson.fromJson(json, StartCustomPollRequestMessage.class);
		
		System.out.println(rxMsg.payload.answers.get(0));
		Assert.assertEquals(rxMsg.header.name, "start_custom_poll");
	}
}
