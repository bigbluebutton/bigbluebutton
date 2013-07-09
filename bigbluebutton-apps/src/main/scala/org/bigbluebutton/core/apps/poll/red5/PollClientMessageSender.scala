package org.bigbluebutton.core.apps.poll.red5

import org.bigbluebutton.conference.meeting.messaging.red5.ConnectionInvokerService
import org.bigbluebutton.core.api.OutMessageListener2
import org.bigbluebutton.core.api.IOutMessage
import org.bigbluebutton.core.apps.poll.messages.GetPollsReplyOutMsg
import org.bigbluebutton.core.apps.poll.messages.PollClearedOutMsg
import org.bigbluebutton.core.apps.poll.messages.PollStartedOutMsg
import org.bigbluebutton.core.apps.poll.messages.PollStoppedOutMsg
import org.bigbluebutton.core.apps.poll.messages.PollRemovedOutMsg
import org.bigbluebutton.core.apps.poll.messages.PollUpdatedOutMsg
import org.bigbluebutton.core.apps.poll.messages.PollCreatedOutMsg
import org.bigbluebutton.conference.meeting.messaging.red5.DirectClientMessage
import com.google.gson.Gson
import org.bigbluebutton.conference.meeting.messaging.red5.BroadcastClientMessage
import java.util.ArrayList
import org.bigbluebutton.core.apps.poll.PollVO
import org.bigbluebutton.core.apps.poll.messages.PollResponseOutMsg

class PollClientMessageSender(service: ConnectionInvokerService) extends OutMessageListener2 {

  	def handleMessage(msg: IOutMessage) {
	  msg match {
	    case getPollsReplyOutMsg: GetPollsReplyOutMsg => handleGetPollsReplyOutMsg(getPollsReplyOutMsg)
	    case pollClearedOutMsg : PollClearedOutMsg => handlePollClearedOutMsg(pollClearedOutMsg)
	    case pollStartedOutMsg: PollStartedOutMsg => handlePollStartedOutMsg(pollStartedOutMsg)
	    case pollStoppedOutMsg: PollStoppedOutMsg => handlePollStoppedOutMsg(pollStoppedOutMsg)
	    case pollRemovedOutMsg: PollRemovedOutMsg => handlePollRemovedOutMsg(pollRemovedOutMsg)
	    case pollUpdatedOutMsg: PollUpdatedOutMsg => handlePollUpdatedOutMsg(pollUpdatedOutMsg)
	    case pollCreatedOutMsg: PollCreatedOutMsg => handlePollCreatedOutMsg(pollCreatedOutMsg)
	    case pollResponseOutMsg: PollResponseOutMsg => handlePollResponseOutMsg(pollResponseOutMsg)
	    case _ => // do nothing
	  }
  	}
  	
  	private def handlePollResponseOutMsg(msg: PollResponseOutMsg) {
  	  val gson = new Gson();
  	  val map = new java.util.HashMap[String, Object]() 
  	  map.put("responder", msg.responder)
  	  map.put("response", msg.response)
  	  
  	  val message = new java.util.HashMap[String, Object]()  	
  	  message.put("msg", gson.toJson(map))
  	  
	  println("PollClientMessageSender - Handling PollResponseOutMsg \n" + message.get("msg") + "\n")
	  
  	  var m = new BroadcastClientMessage(msg.meetingID, "pollResultUpdatedMessage", message);
  	  service.sendMessage(m);	
  	}
  	
  	private def handleGetPollsReplyOutMsg(msg: GetPollsReplyOutMsg) {
  	  val gson = new Gson();
  	  val message = new java.util.HashMap[String, Object]()
  	  
  	  val collection = new ArrayList[PollVO]();
  	  
  	  msg.polls.foreach(p => {
  	    collection.add(p)
  	  })
  	  
	  message.put("msg", gson.toJson(collection))
  	  
	  println("PollClientMessageSender - Handling GetPollsReplyOutMsg \n" + message.get("msg") + "\n")
	  
  	  var m = new DirectClientMessage(msg.meetingID, msg.requesterID, "pollGetPollsReply", message);
  	  service.sendMessage(m);		  
  	}
  	
  	private def handlePollClearedOutMsg(msg: PollClearedOutMsg) {
  	  println("PollClientMessageSender - Handling PollClearedOutMsg")
  	}
  	
  	private def handlePollStartedOutMsg(msg: PollStartedOutMsg) {
  	  println("PollClientMessageSender - Handling PollStartedOutMsg")
  	  
  	  val map = new java.util.HashMap[String, Object]()
  	  map.put("pollID", msg.pollID)
  	  
  	  val gson = new Gson();
  	  val message = new java.util.HashMap[String, Object]()
	  message.put("msg", gson.toJson(map))

	  var m = new BroadcastClientMessage(msg.meetingID, "pollStartedMessage", message);
	  service.sendMessage(m);
  	}
  	
  	private def handlePollStoppedOutMsg(msg: PollStoppedOutMsg) {
  	  println("PollClientMessageSender - Handling PollStoppedOutMsg")
  	  
  	  val map = new java.util.HashMap[String, Object]()
  	  map.put("pollID", msg.pollID)
  	  
  	  val gson = new Gson();
  	  val message = new java.util.HashMap[String, Object]()
	  message.put("msg", gson.toJson(map))

	  var m = new BroadcastClientMessage(msg.meetingID, "pollStoppedMessage", message);
	  service.sendMessage(m);
  	}
  	
  	private def handlePollRemovedOutMsg(msg: PollRemovedOutMsg) {
  	  println("PollClientMessageSender - Handling PollRemovedOutMsg")
  	  val map = new java.util.HashMap[String, Object]()
  	  map.put("pollID", msg.pollID)
  	  
  	  val gson = new Gson();
  	  val message = new java.util.HashMap[String, Object]()
	  message.put("msg", gson.toJson(map))

	  var m = new BroadcastClientMessage(msg.meetingID, "pollDestroyedMessage", message);
	  service.sendMessage(m);
  	}
  	
  	private def handlePollUpdatedOutMsg(msg: PollUpdatedOutMsg) {
  	  println("PollClientMessageSender - Handling PollUpdatedOutMsg")
  	  val gson= new Gson();
  	  val message = new java.util.HashMap[String, Object]()
	  message.put("msg", gson.toJson(msg.pollVO))

	  var m = new BroadcastClientMessage(msg.meetingID, "pollUpdatedMessage", message);
	  service.sendMessage(m);
  	}
  	
  	private def handlePollCreatedOutMsg(msg: PollCreatedOutMsg) {
  	  println("PollClientMessageSender - Handling PollCreatedOutMsg")
  	  val gson= new Gson();
  	  
	  val message = new java.util.HashMap[String, Object]()
	  message.put("msg", gson.toJson(msg.pollVO))

	  var m = new BroadcastClientMessage(msg.meetingID, "pollCreatedMessage", message);
	  service.sendMessage(m);	  
  	}
}