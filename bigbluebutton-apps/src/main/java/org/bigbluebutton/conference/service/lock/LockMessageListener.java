package org.bigbluebutton.conference.service.lock;

import org.bigbluebutton.conference.service.messaging.MessagingConstants;
import org.bigbluebutton.conference.service.messaging.GetLockSettings;
import org.bigbluebutton.conference.service.messaging.LockUser;
import org.bigbluebutton.conference.service.messaging.SendLockSettings;
import org.bigbluebutton.conference.service.messaging.redis.MessageHandler;
import org.bigbluebutton.core.api.IBigBlueButtonInGW;

import com.google.gson.JsonParser;
import com.google.gson.JsonObject;


public class LockMessageListener implements MessageHandler{

	private IBigBlueButtonInGW bbbGW;
	
	public void setBigBlueButtonInGW(IBigBlueButtonInGW bbbGW) {
		this.bbbGW = bbbGW;
	}

	@Override
	public void handleMessage(String pattern, String channel, String message) {
		if (channel.equalsIgnoreCase(MessagingConstants.TO_MEETING_CHANNEL)) {
			JsonParser parser = new JsonParser();
			JsonObject obj = (JsonObject) parser.parse(message);

			if (obj.has("header") && obj.has("payload")) {
				JsonObject header = (JsonObject) obj.get("header");

				if (header.has("name")) {
					String messageName = header.get("name").getAsString();
					if (GetLockSettings.GET_LOCK_SETTINGS.equals(messageName)) {
						GetLockSettings msg = GetLockSettings.fromJson(message);
						bbbGW.getLockSettings(msg.meetingId, msg.userId);
					} else if(LockUser.LOCK_USER.equals(messageName)) {
						LockUser msg = LockUser.fromJson(message);
						bbbGW.lockUser(msg.meetingId, msg.requesterId, msg.lock, msg.internalUserId);
					} else if(SendLockSettings.SEND_LOCK_SETTINGS.equals(messageName)) {
						SendLockSettings msg = SendLockSettings.fromJson(message);
						System.out.println("\n\n(("+message);
						bbbGW.sendLockSettings(msg.meetingId, msg.userId, msg.newSettings);
					}
				}
			}
		}
	}
}
