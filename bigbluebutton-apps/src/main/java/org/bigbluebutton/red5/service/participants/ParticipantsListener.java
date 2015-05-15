
package org.bigbluebutton.red5.service.participants;


//import org.bigbluebutton.core.api.*;

import org.bigbluebutton.red5.BigBlueButtonApplication;
import org.bigbluebutton.red5.api.IBigBlueButtonInGW;
import org.bigbluebutton.red5.pubsub.messages.MessagingConstants;
import org.bigbluebutton.red5.pubsub.redis.MessageHandler;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

import com.google.gson.JsonParser;
import com.google.gson.JsonObject;

public class ParticipantsListener implements MessageHandler{
  private static Logger log = Red5LoggerFactory.getLogger(BigBlueButtonApplication.class, "bigbluebutton");
  
	private IBigBlueButtonInGW bbbInGW;
	
	public void setBigBlueButtonInGW(IBigBlueButtonInGW bbbInGW) {
		this.bbbInGW = bbbInGW;
	}

	@Override
	public void handleMessage(String pattern, String channel, String message) {
		if (channel.equalsIgnoreCase(MessagingConstants.TO_USERS_CHANNEL)) {

			JsonParser parser = new JsonParser();
			JsonObject obj = (JsonObject) parser.parse(message);
			JsonObject headerObject = (JsonObject) obj.get("header");
			JsonObject payloadObject = (JsonObject) obj.get("payload");

			String eventName =  headerObject.get("name").toString().replace("\"", "");

			if(eventName.equalsIgnoreCase("user_leaving_request") ||
				eventName.equalsIgnoreCase("user_raised_hand_message") ||
				eventName.equalsIgnoreCase("user_lowered_hand_message")){

				String roomName = payloadObject.get("meeting_id").toString().replace("\"", "");
				String userID = payloadObject.get("userid").toString().replace("\"", "");

				if(eventName.equalsIgnoreCase("user_leaving_request")){
				  /**
				   * TODO: HTML5 client need to pass this parameter. (ralam jan 22, 2015)
				   */
				  log.warn("TODO: Need to pass sessionId on user_leaving_request message.");
				  String sessionId = "tobeimplemented";
				  bbbInGW.userLeft(roomName, userID, sessionId);
				}
				else if(eventName.equalsIgnoreCase("user_raised_hand_message")){
					bbbInGW.userRaiseHand(roomName, userID);
				}
				else if(eventName.equalsIgnoreCase("user_lowered_hand_message")){
					String requesterID = payloadObject.get("lowered_by").toString().replace("\"", "");
					bbbInGW.lowerHand(roomName, userID, requesterID);
				}
			}
		}
	}
}
