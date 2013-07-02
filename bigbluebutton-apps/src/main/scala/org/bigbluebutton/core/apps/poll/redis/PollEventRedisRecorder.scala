package org.bigbluebutton.core.apps.poll.redis

import org.bigbluebutton.conference.service.recorder.RecorderApplication
import org.bigbluebutton.core.api.OutMessageListener2
import org.bigbluebutton.core.api.IOutMessage
import org.bigbluebutton.core.apps.poll.messages._
import org.bigbluebutton.conference.service.recorder.polling.PollCreatedRecordEvent

class PollEventRedisRecorder(recorder: RecorderApplication) extends OutMessageListener2 {

  	def handleMessage(msg: IOutMessage) {
	  msg match {
	    /*case getPollsReplyOutMsg: GetPollsReplyOutMsg => handleGetPollsReplyOutMsg(getPollsReplyOutMsg)
	    case pollClearedOutMsg : PollClearedOutMsg => handlePollClearedOutMsg(pollClearedOutMsg)
	    case pollStartedOutMsg: PollStartedOutMsg => handlePollStartedOutMsg(pollStartedOutMsg)
	    case pollStoppedOutMsg: PollStoppedOutMsg => handlePollStoppedOutMsg(pollStoppedOutMsg)
	    case pollRemovedOutMsg: PollRemovedOutMsg => handlePollRemovedOutMsg(pollRemovedOutMsg)
	    case pollUpdatedOutMsg: PollUpdatedOutMsg => handlePollUpdatedOutMsg(pollUpdatedOutMsg)*/
	    case pollCreatedOutMsg: PollCreatedOutMsg => handlePollCreatedOutMsg(pollCreatedOutMsg)
	    case _ => // do nothing
	  }
	}
  	
  	def handlePollCreatedOutMsg(msg: PollCreatedOutMsg):Unit = {
		if (msg.recorded) {
			val ev = new PollCreatedRecordEvent();
			ev.setPollID(msg.pollVO.id)
			ev.setTitle(msg.pollVO.title)
			ev.setQuestion(msg.pollVO.questions(0).question)
			//ev.setDatetime(map.datetime)
			// probably the answer will be stored as json
			//ev.setAnswers("")
			ev.setTimestamp(System.currentTimeMillis())
			ev.setMeetingId(msg.meetingID)
			recorder.record(msg.meetingID, ev)					
		}

	}

}