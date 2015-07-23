package org.bigbluebutton.red5.client;


import java.util.HashMap;
import java.util.Map;
import org.bigbluebutton.common.messages.*;
import org.bigbluebutton.red5.client.messaging.BroadcastClientMessage;
import org.bigbluebutton.red5.client.messaging.ConnectionInvokerService;
import org.bigbluebutton.red5.client.messaging.DirectClientMessage;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class PollingClientMessageSender {
	private ConnectionInvokerService service;
	
	public PollingClientMessageSender(ConnectionInvokerService service) {
		this.service = service;
	}
	
	public void handlePollMessage(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
	
				switch (messageName) {
				  case PollStartedMessage.POLL_STARTED:
					  processPollStartedMessage(message);
					  break;
				  case PollStoppedMessage.POLL_STOPPED:
					  processPollStoppedMessage(message);
					  break;
				  case PollShowResultMessage.POLL_SHOW_RESULT:
					  processPollShowResultMessage(message);
					  break;
				  case UserVotedPollMessage.USER_VOTED_POLL:
					  processUserVotedPollMessage(message);
					  break;					  
				}
			}
		}
	}
	
	private void processPollStartedMessage(String json) {
		PollStartedMessage msg = PollStartedMessage.fromJson(json);
		if (msg != null) {
			Map<String, Object> args = new HashMap<String, Object>();
			args.put("poll", msg.poll);

			Map<String, Object> message = new HashMap<String, Object>();
			Gson gson = new Gson();
			message.put("msg", gson.toJson(args));
			
			BroadcastClientMessage b = new BroadcastClientMessage(msg.meetingId, "pollStartedMessage", message);
			service.sendMessage(b);
		}	
	}

	private void processPollStoppedMessage(String json) {
		PollStoppedMessage msg = PollStoppedMessage.fromJson(json);
		  if (msg != null) {
			Map<String, Object> args = new HashMap<String, Object>();
			args.put("pollId", msg.pollId);

			Map<String, Object> message = new HashMap<String, Object>();
			Gson gson = new Gson();
			message.put("msg", gson.toJson(args));
			
			BroadcastClientMessage b = new BroadcastClientMessage(msg.meetingId, "pollStoppedMessage", message);
			service.sendMessage(b);
		  }	
	}
	
	private void processPollShowResultMessage(String json) {
		PollShowResultMessage msg = PollShowResultMessage.fromJson(json);
		  if (msg != null) {
			Map<String, Object> args = new HashMap<String, Object>();
			args.put("poll", msg.poll);

			Map<String, Object> message = new HashMap<String, Object>();
			Gson gson = new Gson();
			message.put("msg", gson.toJson(args));
			
			BroadcastClientMessage b = new BroadcastClientMessage(msg.meetingId, "pollShowResultMessage", message);
			service.sendMessage(b);
		  }	
	}
	
	private void processUserVotedPollMessage(String json) {
		UserVotedPollMessage msg = UserVotedPollMessage.fromJson(json);
		  if (msg != null) {
			Map<String, Object> args = new HashMap<String, Object>();
			args.put("poll", msg.poll);

			Map<String, Object> message = new HashMap<String, Object>();
			Gson gson = new Gson();
			message.put("msg", gson.toJson(args));
			
			DirectClientMessage b = new DirectClientMessage(msg.meetingId, msg.presenterId, "pollUserVotedMessage", message);
			service.sendMessage(b);
		  }	
	}
}
