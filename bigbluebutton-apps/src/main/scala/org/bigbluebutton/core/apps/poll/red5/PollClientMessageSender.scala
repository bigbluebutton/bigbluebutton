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
	    case _ => // do nothing
	  }
  	}
  	
  	private def handleGetPollsReplyOutMsg(msg: GetPollsReplyOutMsg) {
  	  val message = new java.util.HashMap[String, Object]();
  	  
  	  message.put("polls", msg.polls)
  	  
  	  var m = new DirectClientMessage(msg.meetingID, msg.requesterID, "getPollsReply", message);
  	  service.sendMessage(m);	
  	  
  	}
  	
  	private def handlePollClearedOutMsg(msg: PollClearedOutMsg) {
  	  
  	}
  	
  	private def handlePollStartedOutMsg(msg: PollStartedOutMsg) {
  	  
  	}
  	
  	private def handlePollStoppedOutMsg(msg: PollStoppedOutMsg) {
  	  
  	}
  	
  	private def handlePollRemovedOutMsg(msg: PollRemovedOutMsg) {
  	  
  	}
  	
  	private def handlePollUpdatedOutMsg(msg: PollUpdatedOutMsg) {
  	  
  	}
  	
  	private def handlePollCreatedOutMsg(msg: PollCreatedOutMsg) {
  	  
  	}
}