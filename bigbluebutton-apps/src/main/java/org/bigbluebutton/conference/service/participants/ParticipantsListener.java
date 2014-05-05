
package org.bigbluebutton.conference.service.participants;


import org.bigbluebutton.conference.service.messaging.MessagingConstants;
import org.bigbluebutton.conference.service.messaging.redis.MessageHandler;

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
			JsonObject messageObject = (JsonObject)payloadObject.get("message");

			String eventName =  headerObject.get("name").toString().replace("\"", "");

			if(eventName.equalsIgnoreCase("register_user_request") ||
				eventName.equalsIgnoreCase("participant_left") || //TODO the event name is probably incorrect
				eventName.equalsIgnoreCase("participant_join") || //TODO the event name is probably incorrect
				eventName.equalsIgnoreCase("get_users_request") ||
				eventName.equalsIgnoreCase("raise_user_hand_request")){

				String roomName = payloadObject.get("meeting_id").toString().replace("\"", "");

				if(eventName.equalsIgnoreCase("register_user_request")){
					String userID = payloadObject.get("user_id").toString().replace("\"", "");
					String username = payloadObject.get("name").toString().replace("\"", "");
					String role = payloadObject.get("role").toString().replace("\"", "");
					String externUserID = payloadObject.get("external_user_id").toString().replace("\"", "");

					bbbInGW.registerUser(roomName, userID, username, role, externUserID);
				}
				else if(eventName.equalsIgnoreCase("participant_left")){ //TODO the event name is probably incorrect
					String userID = payloadObject.get("user_id").toString().replace("\"", "");

					bbbInGW.userLeft(roomName, userID);
				}
				else if(eventName.equalsIgnoreCase("participant_join")){ //TODO the event name is probably incorrect
					String userID = payloadObject.get("user_id").toString().replace("\"", "");
					String username = payloadObject.get("name").toString().replace("\"", "");
					String role = payloadObject.get("role").toString().replace("\"", "");
					String externUserID = payloadObject.get("external_user_id").toString().replace("\"", "");

					bbbInGW.userJoin(roomName, userID, username, role, externUserID);
				}
				else if(eventName.equalsIgnoreCase("get_users_request")){
					String requesterID = payloadObject.get("requester_id").toString().replace("\"", "");
					bbbInGW.getUsers(roomName, requesterID);
				}
				else if(eventName.equalsIgnoreCase("raise_user_hand_request")){
					String userID = payloadObject.get("user_id").toString().replace("\"", "");
					boolean raise = Boolean.parseBoolean(payloadObject.get("raise").toString().replace("\"", ""));

					if(raise){
						bbbInGW.userRaiseHand(roomName, userID);
					}
					else {
						String requesterID = payloadObject.get("requester_id").toString().replace("\"", "");
						bbbInGW.lowerHand(roomName, userID, requesterID);
					}
				}

				/* //This code was written to support user_joined_event and user_left_event from
				//https://github.com/bigbluebutton/bigbluebutton/blob/bbb-apps-wip/server/bbb-apps/src/test/scala/org/bigbluebutton/endpoint/JsonMessagesFixtures.scala

				JsonParser parser = new JsonParser();
				JsonObject obj = (JsonObject) parser.parse(message);
				JsonObject header = (JsonObject) obj.get("header");
				//System.out.println ("header="+header);
				JsonObject payload = (JsonObject) obj.get("payload");

				String eventName =  header.get("name").toString();
				eventName = eventName.replace("\"", "");//strip off quotations
				System.out.println("eventName="+eventName);

				JsonObject user = (JsonObject) payload.get("user");
				JsonObject meeting = (JsonObject) payload.get("meeting");

				String meetingid =  meeting.get("id").toString().replace("\"", "");
				String userID =  user.get("id").toString().replace("\"", "");
				String username =  user.get("name").toString().replace("\"", "");
				String role =  user.get("role").toString().replace("\"", "");
				String externuserID =  user.get("external_id").toString().replace("\"", "");*/
				/*
				if(eventName.equalsIgnoreCase("user_joined_event")) //put this string into a constants file
				{
					System.out.println("I'm in the case for joined_event" );
					System.out.println("\nmeetingid="+meetingid+", "+"userID = "+userID+", username="+username+
						", role="+role+"external_id="+externuserID);

					bbbGW.userJoin(meetingid, userID, username, role, externuserID);
				}
				else if(eventName.equalsIgnoreCase("user_left_event")) //put this string into a constants file
				{
					System.out.println("I'm in the case for left_event" );
					System.out.println("\nmeetingid="+meetingid+", "+"userID = "+userID);

					bbbGW.userLeft(meetingid, userID);
				}
				*/
			}
		}
	}
}
