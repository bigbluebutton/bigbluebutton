package org.bigbluebutton.core.meeting

import org.bigbluebutton.conference.service.messaging.redis.MessageSender
import org.bigbluebutton.core.api.OutMessageListener2
import org.bigbluebutton.core.api.IOutMessage
import org.bigbluebutton.core.api.KeepAliveMessageReply
import scala.collection.immutable.HashMap
import com.google.gson.Gson
import scala.collection.JavaConverters._
import org.bigbluebutton.conference.service.messaging.MessagingConstants

class MeetingEventRedisPublisher(service: MessageSender) extends OutMessageListener2 {

	private val KEEP_ALIVE_REPLY = "KEEP_ALIVE_REPLY"

	def handleMessage(msg: IOutMessage) {
	  msg match {
	    case keepAliveMessageReply: KeepAliveMessageReply => handleKeepAliveMessageReply(keepAliveMessageReply)
	    case _ => println("Unhandled message in MeetingEventRedisPublisher")
	  }
    }

    private def handleKeepAliveMessageReply(msg: KeepAliveMessageReply):Unit = {
    	val gson = new Gson;
    	var map = Map("messageId" -> KEEP_ALIVE_REPLY)

    	println("check map:" + map.asJava)
    	service.send(MessagingConstants.SYSTEM_CHANNEL, gson.toJson(map.asJava))
	}
}