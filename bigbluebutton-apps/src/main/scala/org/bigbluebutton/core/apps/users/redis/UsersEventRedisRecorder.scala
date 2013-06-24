package org.bigbluebutton.core.apps.users.redis

import org.bigbluebutton.conference.service.recorder.RecorderApplication
import org.bigbluebutton.core.api.OutMessageListener2
import org.bigbluebutton.core.api.IOutMessage
import org.bigbluebutton.core.apps.users.messages._
import org.bigbluebutton.core.api.PresenterAssigned
import org.bigbluebutton.conference.service.recorder.participants.ParticipantEndAndKickAllRecordEvent
import org.bigbluebutton.conference.service.recorder.participants.AssignPresenterRecordEvent
import org.bigbluebutton.conference.service.recorder.participants.ParticipantStatusChangeRecordEvent
import org.bigbluebutton.conference.service.recorder.participants.ParticipantLeftRecordEvent
import org.bigbluebutton.conference.service.recorder.participants.ParticipantJoinRecordEvent

class UsersEventRedisRecorder(recorder: RecorderApplication) extends OutMessageListener2 {

  	def handleMessage(msg: IOutMessage) {
	  msg match {
	    case endMsg: EndAndKickAll => handleEndAndKickAll(endMsg)
	    case assignPres: PresenterAssigned => handleAssignPresenter(assignPres)
	    case userJoin: UserJoined => handleUserJoined(userJoin)
	    case userLeft: UserLeft => handleUserLeft(userLeft)
	    case statusChange: UserStatusChange => handleUserStatusChange(statusChange)
	    case _ => //println("Unhandled message in UsersClientMessageSender")
	  }
	}
  	
  	def handleEndAndKickAll(msg: EndAndKickAll):Unit = {
		if (msg.recorded) {
			val ev = new ParticipantEndAndKickAllRecordEvent();
			ev.setTimestamp(System.currentTimeMillis());
			ev.setMeetingId(msg.meetingID);
			recorder.record(msg.meetingID, ev);					
		}
	}

	private def handleUserJoined(msg: UserJoined):Unit = {
		if (msg.recorded) {
			val ev = new ParticipantJoinRecordEvent();
			ev.setTimestamp(System.currentTimeMillis());
			ev.setUserId(msg.internalUserID);
			ev.setName(msg.name);
			ev.setMeetingId(msg.meetingID);
			ev.setRole(msg.role);

			recorder.record(msg.meetingID, ev);			
		}
	}

	private def handleUserLeft(msg: UserLeft):Unit = {
		if (msg.recorded) {
			val ev = new ParticipantLeftRecordEvent();
			ev.setTimestamp(System.currentTimeMillis());
			ev.setUserId(msg.userID);
			ev.setMeetingId(msg.meetingID);
			
			recorder.record(msg.meetingID, ev);			
		}

	}

	private def handleUserStatusChange(msg: UserStatusChange):Unit = {
		if (msg.recorded) {
			val ev = new ParticipantStatusChangeRecordEvent();
			ev.setTimestamp(System.currentTimeMillis());
			ev.setUserId(msg.userID);
			ev.setMeetingId(msg.meetingID);
			ev.setStatus(msg.status);
			ev.setValue(msg.value.toString());
			
			recorder.record(msg.meetingID, ev);			
		}
	}

	private def handleAssignPresenter(msg:PresenterAssigned):Unit = {
		if (msg.recorded) {
			val event = new AssignPresenterRecordEvent();
			event.setMeetingId(msg.meetingID);
			event.setTimestamp(System.currentTimeMillis());
			event.setUserId(msg.presenter.presenterID);
			event.setName(msg.presenter.presenterName);
			event.setAssignedBy(msg.presenter.assignedBy);
			
			recorder.record(msg.meetingID, event);			
		}

	}
}