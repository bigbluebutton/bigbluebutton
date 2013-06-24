package org.bigbluebutton.core.apps.poll

import scala.collection.mutable.HashMap
import org.bigbluebutton.core.api.InMessage
import org.bigbluebutton.core.api.MessageOutGateway
import scala.collection.mutable.ArrayBuffer

class PollApp(meetingID: String, recorded: Boolean, outGW: MessageOutGateway) {
  import org.bigbluebutton.core.apps.poll.messages._
  
  val model = new PollModel
	
  def handleMessage(msg: InMessage):Unit = {
    msg match {
      case createPoll: CreatePoll => handleCreatePoll(createPoll)
      case updatePoll: UpdatePoll => handleUpdatePoll(updatePoll)
      case destroyPoll: DestroyPoll => handleDestroyPoll(destroyPoll)
      case removePoll: RemovePoll => handleRemovePoll(removePoll)
      case sharePoll: SharePoll => handleSharePoll(sharePoll)
      case stopPoll: StopPoll => handleStopPoll(stopPoll)
      case startPoll: StartPoll => handleStartPoll(startPoll)
      case clearPoll: ClearPoll => handleClearPoll(clearPoll)
      case getPolls: GetPolls => handleGetPolls(getPolls)
    }    
  }
  
  private def handleGetPolls(msg: GetPolls) {
    var polls = model.getPolls
    outGW.send(new GetPollsReplyOutMsg(meetingID, recorded, msg.requesterID, polls))
  }
  
  private def handleClearPoll(msg: ClearPoll) {
    if (model.clearPoll(msg.pollID))  outGW.send(new PollClearedOutMsg(meetingID, recorded, msg.pollID))
  }
  
  private def handleStartPoll(msg: StartPoll) {
	if (model.hasPoll(msg.pollID)) {
	  model.startPoll(msg.pollID)
	  outGW.send(new PollStartedOutMsg(meetingID, recorded, msg.pollID))
	}   
  }
  
  private def handleStopPoll(msg: StopPoll) {
	if (model.hasPoll(msg.pollID)) {
	  model.stopPoll(msg.pollID)
	  outGW.send(new PollStoppedOutMsg(meetingID, recorded, msg.pollID))	  
	}
  }
  
  private def handleSharePoll(msg: SharePoll) {

  }
  
  private def handleRemovePoll(msg: RemovePoll) {
    if (model.hasPoll(msg.pollID)) {
      model.removePoll(msg.pollID)
      outGW.send(new PollRemovedOutMsg(meetingID, recorded, msg.pollID))
    }       
  }
  
  private def handleDestroyPoll(msg: DestroyPoll) {
    
  }
  
  private def handleUpdatePoll(msg: UpdatePoll) {
	if (model.updatePoll(msg.poll)) {
		outGW.send(new PollUpdatedOutMsg(meetingID, recorded, msg.poll.id, msg.poll))	  
	}
  }
  
  private def handleCreatePoll(msg: CreatePoll) {
	outGW.send(new PollCreatedOutMsg(meetingID, recorded, msg.poll.id, msg.poll)) 
  }
}