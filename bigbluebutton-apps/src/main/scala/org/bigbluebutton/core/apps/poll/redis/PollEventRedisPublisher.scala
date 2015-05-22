package org.bigbluebutton.core.apps.poll.redis

import org.bigbluebutton.core.api._
import org.bigbluebutton.conference.service.messaging.redis.MessageSender
import com.google.gson.Gson
import org.bigbluebutton.red5.pubsub.messages.MessagingConstants
import java.util.ArrayList
import org.bigbluebutton.core.apps.poll.PollVO

class PollEventRedisPublisher(service: MessageSender) extends OutMessageListener2 {

  	def handleMessage(msg: IOutMessage) {
	  msg match {
	    case msg: GetPollsReplyOutMsg                 => handleGetPollsReplyOutMsg(msg)
	    case msg: PollClearedOutMsg                   => handlePollClearedOutMsg(msg)
	    case msg: PollStartedOutMsg                   => handlePollStartedOutMsg(msg)
	    case msg: PollStoppedOutMsg                   => handlePollStoppedOutMsg(msg)
	    case msg: PollRemovedOutMsg                   => handlePollRemovedOutMsg(msg)
	    case msg: PollUpdatedOutMsg                   => handlePollUpdatedOutMsg(msg)
	    case msg: PollCreatedOutMsg                   => handlePollCreatedOutMsg(msg)
	    case msg: PollResponseOutMsg                  => handlePollResponseOutMsg(msg)
	    case _ => // do nothing
	  }
  	}
  	
  	private def handlePollResponseOutMsg(msg: PollResponseOutMsg) {
  	  val gson = new Gson();
  	  val map = new java.util.HashMap[String, Object]() 

	  map.put("meetingID", msg.meetingID)
	  map.put("event", "PollResponseEvent")
  	  map.put("responder", msg.responder)
  	  map.put("response", msg.response)

	  service.send(MessagingConstants.FROM_POLLING_CHANNEL, gson.toJson(map));	
  	}
  	
  	private def handleGetPollsReplyOutMsg(msg: GetPollsReplyOutMsg) {
  	  val gson = new Gson();
  	  val message = new java.util.HashMap[String, Object]()
  	  
  	  val collection = new ArrayList[PollVO]();
  	  
  	  msg.polls.foreach(p => {
  	    collection.add(p)
  	  })
  	  
	  message.put("msg", gson.toJson(collection))
  	  
//	  println("PollClientMessageSender - Handling GetPollsReplyOutMsg \n" + message.get("msg") + "\n")
	  	  
  	}
  	
  	private def handlePollClearedOutMsg(msg: PollClearedOutMsg) {
//  	  println("PollClientMessageSender - Handling PollClearedOutMsg")
  	}
  	
  	private def handlePollStartedOutMsg(msg: PollStartedOutMsg) {
//  	  println("PollClientMessageSender - Handling PollStartedOutMsg")
  	  
  	  val gson = new Gson();
  	  val map = new java.util.HashMap[String, Object]()
  	  map.put("meetingID", msg.meetingID)
	  map.put("event", "PollStartedEvent")
  	  map.put("pollID", msg.pollID)
  	  service.send(MessagingConstants.FROM_POLLING_CHANNEL, gson.toJson(map));

  	}
  	
  	private def handlePollStoppedOutMsg(msg: PollStoppedOutMsg) {
//  	  println("PollClientMessageSender - Handling PollStoppedOutMsg")
  	  
  	  val gson = new Gson();
  	  val map = new java.util.HashMap[String, Object]()
  	  map.put("meetingID", msg.meetingID)
	  map.put("event", "PollStoppedEvent")
  	  map.put("pollID", msg.pollID)
  	  service.send(MessagingConstants.FROM_POLLING_CHANNEL, gson.toJson(map));
  	}
  	
  	private def handlePollRemovedOutMsg(msg: PollRemovedOutMsg) {
//  	  println("PollClientMessageSender - Handling PollRemovedOutMsg")
  	  
  	  val gson = new Gson();
  	  val map = new java.util.HashMap[String, Object]()
  	  map.put("meetingID", msg.meetingID)
	  map.put("event", "PollRemovedEvent")
  	  map.put("pollID", msg.pollID)
  	  service.send(MessagingConstants.FROM_POLLING_CHANNEL, gson.toJson(map));
  	}
  	
  	private def handlePollUpdatedOutMsg(msg: PollUpdatedOutMsg) {
//  	  println("PollClientMessageSender - Handling PollUpdatedOutMsg")
  	  val gson = new Gson();
	  val map = new java.util.HashMap[String, Object]()
	  map.put("meetingID", msg.meetingID)
	  map.put("event", "PollUpdatedEvent")
	  map.put("msg", gson.toJson(msg.pollVO))

	  service.send(MessagingConstants.FROM_POLLING_CHANNEL, gson.toJson(map));
  	}
  	
  	private def handlePollCreatedOutMsg(msg: PollCreatedOutMsg) {
//  	  println("PollClientMessageSender - Handling PollCreatedOutMsg")
  	  val gson = new Gson();
  	  
	  val map = new java.util.HashMap[String, Object]()
	  map.put("meetingID", msg.meetingID)
	  map.put("event", "PollCreatedEvent")
	  map.put("msg", gson.toJson(msg.pollVO))

	  service.send(MessagingConstants.FROM_POLLING_CHANNEL, gson.toJson(map));
  	}
}