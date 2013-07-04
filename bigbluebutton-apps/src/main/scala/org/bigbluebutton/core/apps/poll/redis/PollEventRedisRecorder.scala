package org.bigbluebutton.core.apps.poll.redis

import org.bigbluebutton.conference.service.recorder.RecorderApplication
import org.bigbluebutton.core.api.OutMessageListener2
import org.bigbluebutton.core.api.IOutMessage
import org.bigbluebutton.core.apps.poll.messages._
import org.bigbluebutton.conference.service.recorder.polling.PollCreatedRecordEvent
import org.bigbluebutton.conference.service.recorder.polling.PollUpdatedRecordEvent
import org.bigbluebutton.conference.service.recorder.polling.PollRemovedRecordEvent
import org.bigbluebutton.conference.service.recorder.polling.PollStoppedRecordEvent
import org.bigbluebutton.conference.service.recorder.polling.PollStartedRecordEvent
import org.bigbluebutton.conference.service.recorder.polling.PollClearedRecordEvent

class PollEventRedisRecorder(recorder: RecorderApplication) extends OutMessageListener2 {

  	def handleMessage(msg: IOutMessage) {
	  msg match {
	    case getPollsReplyOutMsg: GetPollsReplyOutMsg => // do nothing?
	    case pollClearedOutMsg : PollClearedOutMsg => handlePollClearedOutMsg(pollClearedOutMsg)
	    case pollStartedOutMsg: PollStartedOutMsg => handlePollStartedOutMsg(pollStartedOutMsg)
	    case pollStoppedOutMsg: PollStoppedOutMsg => handlePollStoppedOutMsg(pollStoppedOutMsg)
	    case pollRemovedOutMsg: PollRemovedOutMsg => handlePollRemovedOutMsg(pollRemovedOutMsg)
	    case pollUpdatedOutMsg: PollUpdatedOutMsg => handlePollUpdatedOutMsg(pollUpdatedOutMsg)
	    case pollCreatedOutMsg: PollCreatedOutMsg => handlePollCreatedOutMsg(pollCreatedOutMsg)
	    case _ => // do nothing
	  }
	}
  	
  	def handlePollCreatedOutMsg(msg: PollCreatedOutMsg):Unit = {
		if (msg.recorded) {
			val ev = new PollCreatedRecordEvent();
			ev.setPollID(msg.pollVO.id)
			ev.setTitle(msg.pollVO.title)

			for ( q <- msg.pollVO.questions ) {
				ev.addQuestion(q.id, q.question, q.multiResponse)
				for( resp <- q.responses ){
					ev.addResponse(q.id, resp.id, resp.text)
					
					/*for( responder <- resp.responders ){
						ev.addResponder(q.id, resp.id, responder.id, )
					}*/
				}
			}

			ev.setTimestamp(System.currentTimeMillis())
			ev.setMeetingId(msg.meetingID)
			recorder.record(msg.meetingID, ev)					
		}

	}

	def handlePollUpdatedOutMsg(msg:PollUpdatedOutMsg):Unit = {
		if(msg.recorded){
			val ev = new PollUpdatedRecordEvent();
			ev.setPollID(msg.pollVO.id)
			ev.setTitle(msg.pollVO.title)

			for ( q <- msg.pollVO.questions ) {
				ev.addQuestion(q.id, q.question, q.multiResponse)
				for( resp <- q.responses ){
					ev.addResponse(q.id, resp.id, resp.text)
					
					/*for( responder <- resp.responders ){
						ev.addResponder(q.id, resp.id, responder.id, )
					}*/
				}
			}

			ev.setTimestamp(System.currentTimeMillis())
			ev.setMeetingId(msg.meetingID)
			recorder.record(msg.meetingID, ev)	
		}
	}

	def handlePollRemovedOutMsg(msg:PollRemovedOutMsg):Unit = {
		if(msg.recorded){
			val ev = new PollRemovedRecordEvent()
			ev.setPollID(msg.pollID)
			ev.setTimestamp(System.currentTimeMillis())
			ev.setMeetingId(msg.meetingID)
			recorder.record(msg.meetingID, ev)	
		}
	}

	def handlePollStoppedOutMsg(msg:PollStoppedOutMsg):Unit = {
		if(msg.recorded){
			val ev = new PollStoppedRecordEvent()
			ev.setPollID(msg.pollID)
			ev.setTimestamp(System.currentTimeMillis())
			ev.setMeetingId(msg.meetingID)
			recorder.record(msg.meetingID, ev)
		}
	}

	def handlePollStartedOutMsg(msg:PollStartedOutMsg):Unit = {
		if(msg.recorded){
			val ev = new PollStartedRecordEvent()
			ev.setPollID(msg.pollID)
			ev.setTimestamp(System.currentTimeMillis())
			ev.setMeetingId(msg.meetingID)
			recorder.record(msg.meetingID, ev)	
		}
	}

	def handlePollClearedOutMsg(msg:PollClearedOutMsg):Unit = {
		if(msg.recorded){
			val ev = new PollClearedRecordEvent()
			ev.setPollID(msg.pollID)
			ev.setTimestamp(System.currentTimeMillis())
			ev.setMeetingId(msg.meetingID)
			recorder.record(msg.meetingID, ev)	
		}	
	}


}