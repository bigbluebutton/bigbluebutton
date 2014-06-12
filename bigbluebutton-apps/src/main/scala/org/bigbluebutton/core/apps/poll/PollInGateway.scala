package org.bigbluebutton.core.apps.poll

import org.bigbluebutton.core.BigBlueButtonGateway
import org.bigbluebutton.core.api._

class PollInGateway(bbbGW: BigBlueButtonGateway) {

  val msgConverter = new PollMessageConverter
  
  def getPolls(meetingID: String, requesterID: String) {
    bbbGW.accept(new GetPolls(meetingID, requesterID))
  }

  def preCreatedPoll(meetingID: String, msg: String) {
	val pvo = msgConverter.convertPreCreatedPollMessage(msg)
	bbbGW.accept(new PreCreatedPoll(meetingID, pvo))
  }
    
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
	val pollResponse = msgConverter.convertTakePollMessage(msg)
	bbbGW.accept(new RespondToPoll(meetingID, requesterID, pollResponse))
  }
  
  def showPollResult(meetingID: String, requesterID: String, pollID: String) {  
	bbbGW.accept(new ShowPollResult(meetingID, requesterID, pollID))
  }
	
  def hidePollResult(meetingID: String, requesterID: String, pollID: String) {
	bbbGW.accept(new HidePollResult(meetingID, requesterID, pollID))
  }
}