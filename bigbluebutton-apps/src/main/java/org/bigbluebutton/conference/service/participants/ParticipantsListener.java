
package org.bigbluebutton.conference.service.participants;


import org.bigbluebutton.conference.service.messaging.MessagingConstants;
import org.bigbluebutton.conference.service.messaging.redis.MessageHandler;

//import org.bigbluebutton.conference.service.participants.participantsApplication;
import org.bigbluebutton.core.api.IBigBlueButtonInGW;
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

			JsonObject user = (JsonObject) payload.get("user");
			JsonObject meeting = (JsonObject) payload.get("meeting");

			String meetingid = (String) meeting.get("id").toString().replace("\"", "");
			String userid = (String) user.get("id").toString().replace("\"", "");
			String username = (String) user.get("name").toString().replace("\"", "");
			String role = (String) user.get("role").toString().replace("\"", "");
			String externuserid = (String) user.get("external_id").toString().replace("\"", "");

			if(eventName.equalsIgnoreCase("user_joined_event")) //put this string into a constants file
			{
				System.out.println("I'm in the case for joined_event" );
				System.out.println("\nmeetingid="+meetingid+", "+"userid = "+userid+", username="+username+
					", role="+role+"external_id="+externuserid);

				bbbGW.userJoin(meetingid, userid, username, role, externuserid);
			}
			else if(eventName.equalsIgnoreCase("user_left_event")) //put this string into a constants file
			{
				System.out.println("I'm in the case for left_event" );
				System.out.println("\nmeetingid="+meetingid+", "+"userid = "+userid);

				bbbGW.userLeft(meetingid, userid);
			}
		}
	}

	
}


