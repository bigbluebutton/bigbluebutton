package org.bigbluebutton.red5.client;

import org.bigbluebutton.red5.pubsub.messages.GoToSlideMessage;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class PresentationClientMessageSender {

	public void handlePresentationMessage(String message) {

		System.out.println("MEEssage:" + message);
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				System.out.println("MESSAGE:"+message);
				switch (messageName) {
				  case GoToSlideMessage.GO_TO_SLIDE:
					  GoToSlideMessage gts = GoToSlideMessage.fromJson(message);
					  if (gts != null) {
						  processGoToSlideMessage(gts);
					  }
					  break;
				  default:
					  System.out.println("DUNNO" + message);
				}
			}
		}
		
	}

	private void processGoToSlideMessage(GoToSlideMessage gts) {
		System.out.println("GOTOSLIDEMESSAGE****************");
		
	}

}
