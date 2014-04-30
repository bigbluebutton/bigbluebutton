package org.bigbluebutton.core.apps.users.redis

import org.bigbluebutton.conference.service.messaging.redis.MessageSender
import org.bigbluebutton.core.api._
import org.bigbluebutton.conference.service.messaging.MessagingConstants
import com.google.gson.Gson

class UsersEventRedisPublisher(service: MessageSender) extends OutMessageListener2 {

    def handleMessage(msg: IOutMessage) {
	  msg match {
	    case msg: UserJoined                            => handleUserJoined(msg)
	    case msg: UserLeft                              => handleUserLeft(msg)
	    case msg: UserStatusChange                      => handleUserStatusChange(msg)
	    case _ => //println("Unhandled message in UsersClientMessageSender")
	  }
	}
    
    private def handleUserStatusChange(msg: UserStatusChange) {
		val map= new java.util.HashMap[String, String]();
		map.put("meetingID", msg.meetingID);
		map.put("messageID", MessagingConstants.USER_STATUS_CHANGE_EVENT);
			
		map.put("internalUserID", msg.userID);
		map.put("status", msg.status);
		map.put("value", msg.value.toString);
			
		val gson= new Gson();
		service.send(MessagingConstants.PARTICIPANTS_CHANNEL, gson.toJson(map));
		
		service.send(MessagingConstants.BIGBLUEBUTTON_WEBHOOK_EVENTS, gson.toJson(map));
	}
	
	private def handleUserJoined(msg: UserJoined) {
		println("UsersEventRedisPublisher: init handleUserJoined")
		val map= new java.util.HashMap[String, String]();
		map.put("meetingID", msg.meetingID);
		map.put("messageID", MessagingConstants.USER_JOINED_EVENT);
		map.put("internalUserID", msg.user.userID);
		map.put("externalUserID", msg.user.externUserID);
		map.put("fullname", msg.user.name);
		map.put("role", msg.user.role.toString());
			
		val gson= new Gson();
		service.send(MessagingConstants.PARTICIPANTS_CHANNEL, gson.toJson(map));
		println("UsersEventRedisPublisher: end handleUserJoined")
		
		service.send(MessagingConstants.BIGBLUEBUTTON_WEBHOOK_EVENTS, gson.toJson(map));

		//Anton: for user_joined_event ---start------------
		println("UsersEventRedisPublisher: init handleUserJoined ***Anton")

		//HEADER
		var header = new java.util.HashMap[String, Any]()
		header.put("name", "user_joined_event") //not the same as MessagingConstants.USER_JOINED_EVENT
		header.put("timestamp", "Mon, 31 Mar 2014 14:49:07 GMT")
		header.put("source", "bbb-web")
		var destination = new java.util.HashMap[String, String]()
		destination.put("to", "apps_channel")
		header.put("destination", destination)

		//PAYLOAD
		var payload = new java.util.HashMap[String, Object]()

		var meeting = new java.util.HashMap[String, String]()
		meeting.put("id", msg.meetingID)
		meeting.put("name", "English 101")
		payload.put("meeting", meeting)

		payload.put("session", "someSessionId")

		var user = new java.util.HashMap[String, Any]()
		user.put("id", msg.user.userID)
		user.put("external_id", msg.user.externUserID)
		user.put("name", msg.user.name)
		user.put("role", msg.user.role.toString())
		user.put("pin", 12345)
		user.put("welcome_message", "Welcome to English 101")
		user.put("logout_url", "http://www.example.com")
		user.put("avatar_url", "http://www.example.com/avatar.png")
		user.put("is_presenter", true)


		var status = new java.util.HashMap[String, Boolean]()
		status.put("hand_raised", false)
		status.put("muted", false)
		status.put("locked", false)
		status.put("talking", false)
		user.put("status", status)

		var caller_id = new java.util.HashMap[String, String]()
		caller_id.put("name", "Juan Tamad")
		caller_id.put("number", "011-63-917-555-1234")
		user.put("caller_id", caller_id)

		var media_streams : Array[Object] = new Array[Object](3)
		var audio = new java.util.HashMap[String, Any]()
		audio.put("media_type", "audio")
		audio.put("uri", "http://cdn.bigbluebutton.org/stream/a1234")
		var meta = new java.util.HashMap[String, String]() //common among the 3 objects
		meta.put("foo", "bar")
		audio.put("metadata", meta)

		var video = new java.util.HashMap[String, Any]()
		video.put("media_type", "video")
		video.put("uri", "http://cdn.bigbluebutton.org/stream/v1234")
		video.put("metadata", meta)

		var screen = new java.util.HashMap[String, Any]()
		screen.put("media_type", "screen")
		screen.put("uri", "http://cdn.bigbluebutton.org/stream/s1234")
		screen.put("metadata", meta)

		media_streams(0) = audio
		media_streams(1) = video
		media_streams(2) = screen

		user.put("media_streams", media_streams)

		var metadata = new java.util.HashMap[String, String]()
		metadata.put("student_id", "54321")
		metadata.put("program", "engineering")
		user.put("metadata", metadata)

		payload.put("user", user)

		var usrJoinedEvent = new java.util.HashMap[String, Object]()
		usrJoinedEvent.put("header", header)
		usrJoinedEvent.put("payload", payload)

		println("UserJoinedEvent**NEW - " + gson.toJson(usrJoinedEvent) + "\n")
		
		//Should we keep sending the message to both channels?! //TODO
//		service.send(MessagingConstants.PARTICIPANTS_CHANNEL, gson.toJson(usrJoinedEvent));
		println("UsersEventRedisPublisher: end handleUserJoined ***Anton")
		
//		service.send(MessagingConstants.BIGBLUEBUTTON_WEBHOOK_EVENTS, gson.toJson(usrJoinedEvent));
		//Anton: for user_joined_event ---end------------
	}
	
	private def handleUserLeft(msg: UserLeft) {
		println("UsersEventRedisPublisher: init handleUserLeft")		
		val map= new java.util.HashMap[String, String]();
		map.put("meetingID", msg.meetingID);
		map.put("messageID", MessagingConstants.USER_LEFT_EVENT);
		map.put("internalUserID", msg.user.userID);
			
		val gson= new Gson();
		service.send(MessagingConstants.PARTICIPANTS_CHANNEL, gson.toJson(map));
		
		service.send(MessagingConstants.BIGBLUEBUTTON_WEBHOOK_EVENTS, gson.toJson(map));
		
		println("UsersEventRedisPublisher: end handleUserLeft")

		//
		//Event handled by the HTML5 client (and node)
		println("UsersEventRedisPublisher: init handleUserLeft***Anton")		
		
		//HEADER
		var header = new java.util.HashMap[String, Any]()
		header.put("name", "user_left_event") //not the same as MessagingConstants.USER_LEFT_EVENT
		header.put("timestamp", "Mon, 31 Mar 2014 14:49:07 GMT")
		header.put("source", "web-api")
		var destination = new java.util.HashMap[String, String]()
		destination.put("to", "apps_channel")
		header.put("destination", destination)

		//PAYLOAD
		var payload = new java.util.HashMap[String, Object]()

		var meeting = new java.util.HashMap[String, String]()
		meeting.put("id", msg.meetingID)
		meeting.put("name", "English 101")
		payload.put("meeting", meeting)

		payload.put("session", "someSessionId")

		var user = new java.util.HashMap[String, Any]()
		user.put("id", msg.user.userID)
		user.put("name", msg.user.name)
		payload.put("user", user)


		var usrLeftEvent = new java.util.HashMap[String, Object]()
		usrLeftEvent.put("header", header)
		usrLeftEvent.put("payload", payload)


//		service.send(MessagingConstants.PARTICIPANTS_CHANNEL, gson.toJson(usrLeftEvent));
		
		//service.send(MessagingConstants.BIGBLUEBUTTON_WEBHOOK_EVENTS, gson.toJson(usrLeftEvent));
		
		println("UsersEventRedisPublisher: end handleUserLeft***Anton")
	}
}