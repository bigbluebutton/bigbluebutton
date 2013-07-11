package org.bigbluebutton.core.meeting

import org.bigbluebutton.conference.service.messaging.redis.MessageSender
import org.bigbluebutton.core.api.OutMessageListener2
import org.bigbluebutton.core.api.IOutMessage
import org.bigbluebutton.core.api.KeepAliveMessageReply
import org.bigbluebutton.core.api.MeetingCreated
import org.bigbluebutton.core.api.MeetingEnded
import scala.collection.immutable.HashMap
import com.google.gson.Gson
import scala.collection.JavaConverters._
import org.bigbluebutton.conference.service.messaging.MessagingConstants

class MeetingEventRedisPublisher(service: MessageSender) extends OutMessageListener2 {

	private val KEEP_ALIVE_REPLY = "KEEP_ALIVE_REPLY"

	def handleMessage(msg: IOutMessage) {
	  msg match {
	  	case meetingCreated: MeetingCreated => handleMeetingCreated(meetingCreated)
	  	case meetingEnded: MeetingEnded => handleMeetingEnded(meetingEnded)
	    case keepAliveMessageReply: KeepAliveMessageReply => handleKeepAliveMessageReply(keepAliveMessageReply)
	    case _ => //println("Unhandled message in MeetingEventRedisPublisher")
	  }
    }

    private def handleKeepAliveMessageReply(msg: KeepAliveMessageReply):Unit = {
    	val gson = new Gson
    	var map = Map("messageID" -> KEEP_ALIVE_REPLY, "aliveID" -> msg.aliveID)
    	service.send(MessagingConstants.SYSTEM_CHANNEL, gson.toJson(map.asJava))
	}

	private def handleMeetingCreated(msg:MeetingCreated):Unit = {
		val gson = new Gson
    	var map = Map("messageID" -> MessagingConstants.MEETING_STARTED_EVENT, "meetingID" -> msg.meetingID)
    	service.send(MessagingConstants.SYSTEM_CHANNEL, gson.toJson(map.asJava))	
	}

	private def handleMeetingEnded(msg:MeetingEnded):Unit = {
		val gson = new Gson
    	var map = Map("messageID" -> MessagingConstants.MEETING_ENDED_EVENT, "meetingID" -> msg.meetingID)
    	service.send(MessagingConstants.SYSTEM_CHANNEL, gson.toJson(map.asJava))	
	}
}