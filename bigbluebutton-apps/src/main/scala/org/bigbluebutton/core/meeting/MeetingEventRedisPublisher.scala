package org.bigbluebutton.core.meeting

import org.bigbluebutton.conference.service.messaging.redis.MessageSender
import org.bigbluebutton.core.api.OutMessageListener2
import org.bigbluebutton.core.api.IOutMessage
import org.bigbluebutton.core.api.KeepAliveMessageReply

class MeetingEventRedisPublisher(service: MessageSender) extends OutMessageListener2 {

	def handleMessage(msg: IOutMessage) {
	  msg match {
	    case keepAliveMessageReply: KeepAliveMessageReply => handleKeepAliveMessageReply(keepAliveMessageReply)
	    case _ => println("Unhandled message in UsersClientMessageSender")
	  }
    }

    private def handleKeepAliveMessageReply(msg: KeepAliveMessageReply):Unit = {
    	service.send("test:channel", "pong")
	}
}