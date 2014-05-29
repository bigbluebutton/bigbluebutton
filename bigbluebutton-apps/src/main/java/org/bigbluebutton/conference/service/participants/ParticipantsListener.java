
package org.bigbluebutton.conference.service.participants;


import org.bigbluebutton.conference.service.messaging.MessagingConstants;
import org.bigbluebutton.conference.service.messaging.redis.MessageHandler;
//import org.bigbluebutton.core.api.*;

import org.bigbluebutton.core.api.IBigBlueButtonInGW;
import com.google.gson.JsonParser;
import com.google.gson.JsonObject;

public class ParticipantsListener implements MessageHandler{
	
	private IBigBlueButtonInGW bbbInGW;
	
	public void setBigBlueButtonInGW(IBigBlueButtonInGW bbbInGW) {
		this.bbbInGW = bbbInGW;
	}

	@Override
	public void handleMessage(String pattern, String channel, String message) {
		if (channel.equalsIgnoreCase(MessagingConstants.TO_USERS_CHANNEL)) {
			System.out.println("AntonChannel=(participants)" + channel);

			JsonParser parser = new JsonParser();
			JsonObject obj = (JsonObject) parser.parse(message);
			JsonObject headerObject = (JsonObject) obj.get("header");
			JsonObject payloadObject = (JsonObject) obj.get("payload");

			String eventName =  headerObject.get("name").toString().replace("\"", "");

			if(eventName.equalsIgnoreCase("user_leaving_request") ||
				eventName.equalsIgnoreCase("raise_user_hand_request")){

				String roomName = payloadObject.get("meeting_id").toString().replace("\"", "");
				String userID = payloadObject.get("userid").toString().replace("\"", "");

				if(eventName.equalsIgnoreCase("user_leaving_request")){
					bbbInGW.userLeft(roomName, userID);
				}
				else if(eventName.equalsIgnoreCase("raise_user_hand_request")){
					boolean raise = Boolean.parseBoolean(payloadObject.get("raise").toString().replace("\"", ""));

					if(raise){
						bbbInGW.userRaiseHand(roomName, userID);
					}
					else {
						String requesterID = payloadObject.get("requester_id").toString().replace("\"", "");
						bbbInGW.lowerHand(roomName, userID, requesterID);
					}
				}
			}
		}
	}
}
