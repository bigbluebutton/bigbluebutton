
package org.bigbluebutton.red5.service.whiteboard;


import org.bigbluebutton.red5.api.IBigBlueButtonInGW;
import org.bigbluebutton.red5.service.messaging.MessagingConstants;
import org.bigbluebutton.red5.service.messaging.redis.MessageHandler;

import com.google.gson.JsonParser;
import com.google.gson.JsonObject;

public class WhiteboardListener implements MessageHandler{
	
	private IBigBlueButtonInGW bbbInGW;
	
	public void setBigBlueButtonInGW(IBigBlueButtonInGW bbbInGW) {
		this.bbbInGW = bbbInGW;
	}

	@Override
	public void handleMessage(String pattern, String channel, String message) {
		if (channel.equalsIgnoreCase(MessagingConstants.TO_WHITEBOARD_CHANNEL)) {

			JsonParser parser = new JsonParser();
			JsonObject obj = (JsonObject) parser.parse(message);
			JsonObject headerObject = (JsonObject) obj.get("header");
			JsonObject payloadObject = (JsonObject) obj.get("payload");

			String eventName =  headerObject.get("name").toString().replace("\"", "");

			if(eventName.equalsIgnoreCase("get_whiteboard_shapes_request")){
			//more cases to follow

				String roomName = payloadObject.get("meeting_id").toString().replace("\"", "");

				if(eventName.equalsIgnoreCase("get_whiteboard_shapes_request")){
					String requesterID = payloadObject.get("requester_id").toString().replace("\"", "");
					if(payloadObject.get("whiteboard_id") != null){
						String whiteboardID = payloadObject.get("whiteboard_id").toString().replace("\"", "");
						System.out.println("\n FOUND A whiteboardID:" + whiteboardID + "\n");
						bbbInGW.requestWhiteboardAnnotationHistory(roomName, requesterID, whiteboardID, requesterID);
					}
					else {
						System.out.println("\n DID NOT FIND A whiteboardID \n");
					}
					System.out.println("\n user<" + requesterID + "> requested the shapes.\n");
				}
			}
		}
	}
}
