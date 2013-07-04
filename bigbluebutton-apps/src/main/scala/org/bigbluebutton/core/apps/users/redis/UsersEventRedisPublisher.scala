package org.bigbluebutton.core.apps.users.redis

import org.bigbluebutton.conference.service.messaging.redis.MessageSender
import org.bigbluebutton.core.api.OutMessageListener2
import org.bigbluebutton.core.api.IOutMessage
import org.bigbluebutton.core.apps.users.messages.UserStatusChange
import org.bigbluebutton.conference.service.messaging.MessagingConstants
import com.google.gson.Gson
import org.bigbluebutton.core.apps.users.messages.UserJoined
import org.bigbluebutton.core.api.UserLeft

class UsersEventRedisPublisher(service: MessageSender) extends OutMessageListener2 {

    def handleMessage(msg: IOutMessage) {
	  msg match {
	    case userJoin: UserJoined => handleUserJoined(userJoin)
	    case userLeft: UserLeft => handleUserLeft(userLeft)
	    case statusChange: UserStatusChange => handleUserStatusChange(statusChange)
	    case _ => //println("Unhandled message in UsersClientMessageSender")
	  }
	}
    
    private def handleUserStatusChange(msg: UserStatusChange) {
		val map= new java.util.HashMap[String, String]();
		map.put("meetingId", msg.meetingID);
		map.put("messageId", MessagingConstants.USER_STATUS_CHANGE_EVENT);
			
		map.put("internalUserId", msg.userID);
		map.put("status", msg.status);
		map.put("value", msg.value.toString);
			
		val gson= new Gson();
		service.send(MessagingConstants.PARTICIPANTS_CHANNEL, gson.toJson(map));
	}
	
	private def handleUserJoined(msg: UserJoined) {
		println("UsersEventRedisPublisher: init handleUserJoined")
		val map= new java.util.HashMap[String, String]();
		map.put("meetingId", msg.meetingID);
		map.put("messageId", MessagingConstants.USER_JOINED_EVENT);
		map.put("internalUserId", msg.internalUserID);
		map.put("externalUserId", msg.externalUserID);
		map.put("fullname", msg.name);
		map.put("role", msg.role);
			
		val gson= new Gson();
		service.send(MessagingConstants.PARTICIPANTS_CHANNEL, gson.toJson(map));
		println("UsersEventRedisPublisher: end handleUserJoined")
	}
	
	private def handleUserLeft(msg: UserLeft) {		
		val map= new java.util.HashMap[String, String]();
		map.put("meetingId", msg.meetingID);
		map.put("messageId", MessagingConstants.USER_LEFT_EVENT);
		map.put("internalUserId", msg.userID);
			
		val gson= new Gson();
		service.send(MessagingConstants.PARTICIPANTS_CHANNEL, gson.toJson(map));
	}
}