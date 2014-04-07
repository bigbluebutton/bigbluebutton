
package org.bigbluebutton.conference.service.participants;

import java.util.HashMap;
import java.util.Map;

import org.apache.commons.lang.StringEscapeUtils;
import org.bigbluebutton.conference.service.messaging.MessagingConstants;
import org.bigbluebutton.conference.service.messaging.redis.MessageHandler;

//import org.bigbluebutton.conference.service.participants.participantsApplication;
import org.bigbluebutton.core.api.IBigBlueButtonInGW;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.google.gson.JsonParser;
import com.google.gson.JsonObject;

public class ParticipantsListener implements MessageHandler{
	
	private IBigBlueButtonInGW bbbGW;
	
	public void setBigBlueButtonInGW(IBigBlueButtonInGW bbbGW) {
		this.bbbGW = bbbGW;
	}

	@Override
	public void handleMessage(String pattern, String channel, String message) {
		if (channel.equalsIgnoreCase(MessagingConstants.ANTON_CHANNEL))
		{
			System.out.println("AntonChannel=(participants)" + channel);
			//System.out.println("AntonMessage=" + message);

			JsonParser parser = new JsonParser();
			JsonObject obj = (JsonObject) parser.parse(message);
			JsonObject header = (JsonObject) obj.get("header");
			//System.out.println ("header="+header);
			JsonObject payload = (JsonObject) obj.get("payload");

			String eventName = (String) header.get("name").toString();
			eventName = eventName.replace("\"", "");//strip off quotations
			System.out.println("eventName="+eventName);

			if(eventName.equalsIgnoreCase("user_joined_event")) //put this string into a constants file
			{
				System.out.println("I'm in the case for joined_event" );
				
				JsonObject user = (JsonObject) payload.get("user");
				JsonObject meeting = (JsonObject) payload.get("meeting");
				
				String meetingID = (String) meeting.get("id").toString().replace("\"", "");
				String userid = (String) user.get("id").toString().replace("\"", "");
				String username = (String) user.get("name").toString().replace("\"", "");
				String role = (String) user.get("role").toString().replace("\"", "");
				String externUserID = (String) user.get("external_id").toString().replace("\"", "");

				System.out.println("4");
				System.out.println("\nmeetingID="+meetingID+", "+"userid = "+userid+", username="+username+", role="+role+
					"external_id="+externUserID);

				bbbGW.userJoin(meetingID, userid,  username, role, externUserID);

				System.out.println("5");
			}
			else if(eventName.equalsIgnoreCase("user_left_event")) //put this string into a constants file
			{
				System.out.println("I'm in the case for left_event" );
			}
		}
	}

	
}


