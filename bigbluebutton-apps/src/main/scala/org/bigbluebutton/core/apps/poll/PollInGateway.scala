package org.bigbluebutton.core.apps.poll

import org.bigbluebutton.conference.service.poll.PollInGW
import org.bigbluebutton.core.BigBlueButtonGateway
import org.bigbluebutton.core.apps.poll.messages.CreatePoll
import org.bigbluebutton.core.apps.poll.messages.UpdatePoll
import org.bigbluebutton.core.apps.poll.messages.StartPoll
import org.bigbluebutton.core.apps.poll.messages.StopPoll
import org.bigbluebutton.core.apps.poll.messages.RemovePoll

class PollInGateway(bbbGW: BigBlueButtonGateway) {

  val msgConverter = new PollMessageConverter
  
  def createPoll(meetingID: String, requesterID: String, msg: String) {
	val pvo = msgConverter.convertCreatePollMessage(msg)
	bbbGW.accept(new CreatePoll(meetingID, requesterID, pvo))
  }

  def updatePoll(meetingID: String, requesterID: String, msg: String) {
	val pvo = msgConverter.convertUpdatePollMessage(msg)
	bbbGW.accept(new UpdatePoll(meetingID, requesterID, pvo)) 
  }

  def startPoll(meetingID: String, requesterID: String, msg: String) {
	val pollID = msgConverter.convertStartPollMessage(msg)
	bbbGW.accept(new StartPoll(meetingID, requesterID, pollID))
  }

  def stopPoll(meetingID: String, requesterID: String, msg: String) {
	val pollID = msgConverter.convertStopPollMessage(msg)
	bbbGW.accept(new StopPoll(meetingID, requesterID, pollID))
  }

  def removePoll(meetingID: String, requesterID: String, msg: String) {
	val pollID = msgConverter.convertRemovePollMessage(msg)
	bbbGW.accept(new RemovePoll(meetingID, requesterID, pollID))
  }

  def respondPoll(meetingID: String, requesterID: String, msg: String) {

  }
}