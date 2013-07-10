package org.bigbluebutton.core.apps.poll

import scala.collection.mutable.HashMap
import org.bigbluebutton.core.api.InMessage
import org.bigbluebutton.core.api.MessageOutGateway
import scala.collection.mutable.ArrayBuffer
import org.bigbluebutton.core.apps.users.UsersApp

class PollApp(meetingID: String, recorded: Boolean, outGW: MessageOutGateway, usersApp: UsersApp) {
  import org.bigbluebutton.core.apps.poll.messages._
  
  val model = new PollModel
	
  def handleMessage(msg: InMessage):Unit = {
    msg match {
      case preCreatePoll: PreCreatedPoll => handlePreCreatedPoll(preCreatePoll)
      case createPoll: CreatePoll => handleCreatePoll(createPoll)
      case updatePoll: UpdatePoll => handleUpdatePoll(updatePoll)
      case destroyPoll: DestroyPoll => handleDestroyPoll(destroyPoll)
      case removePoll: RemovePoll => handleRemovePoll(removePoll)
      case sharePoll: SharePoll => handleSharePoll(sharePoll)
      case stopPoll: StopPoll => handleStopPoll(stopPoll)
      case startPoll: StartPoll => handleStartPoll(startPoll)
      case clearPoll: ClearPoll => handleClearPoll(clearPoll)
      case getPolls: GetPolls => handleGetPolls(getPolls)
      case respondPoll: RespondToPoll => handleRespondToPoll(respondPoll)
      case _ => // do nothing
    }    
  }
  
  private def handleRespondToPoll(msg: RespondToPoll) {   
    val pollID = msg.response.pollID

	 if (model.hasPoll(pollID)) {
	   if (usersApp.hasUser(msg.requesterID)) {
	     val user = usersApp.getUser(msg.requesterID)
	     val responder = new Responder(user.userID, user.name)
	     msg.response.responses.foreach(question => {
	       question.responseIDs.foreach(response => {
	         model.respondToQuestion(pollID, question.questionID, response, responder)
	       })
	     })	
	     
	     model.getPoll(msg.response.pollID) match {
	       case Some(poll) => outGW.send(new PollResponseOutMsg(meetingID, recorded, responder, msg.response))
	       case None => // do nothing
	     }
	   }
	 }
  }
  
  private def handleGetPolls(msg: GetPolls) {
    var polls = model.getPolls
    outGW.send(new GetPollsReplyOutMsg(meetingID, recorded, msg.requesterID, polls))
  }
  
  private def handleClearPoll(msg: ClearPoll) {
    if (model.clearPoll(msg.pollID))  {
      outGW.send(new PollClearedOutMsg(meetingID, recorded, msg.pollID))
    } else {
	  print("PollApp:: handleClearPoll - " + msg.pollID + " not found" )
	}
  }
  
  private def handleStartPoll(msg: StartPoll) {
	if (model.hasPoll(msg.pollID)) {
	  model.startPoll(msg.pollID)
	  outGW.send(new PollStartedOutMsg(meetingID, recorded, msg.pollID))
	} else {
	  print("PollApp:: handleStartPoll - " + msg.pollID + " not found" )
	}
  }
  
  private def handleStopPoll(msg: StopPoll) {
	if (model.hasPoll(msg.pollID)) {
	  model.stopPoll(msg.pollID)
	  outGW.send(new PollStoppedOutMsg(meetingID, recorded, msg.pollID))	  
	} else {
	  print("PollApp:: handleStopPoll - " + msg.pollID + " not found" )
	}
  }
  
  private def handleSharePoll(msg: SharePoll) {

  }
  
  private def handleRemovePoll(msg: RemovePoll) {
    if (model.hasPoll(msg.pollID)) {
      model.removePoll(msg.pollID)
      outGW.send(new PollRemovedOutMsg(meetingID, recorded, msg.pollID))
    } else {
	  print("PollApp:: handleRemovePoll - " + msg.pollID + " not found" )
	}        
  }
  
  private def handleDestroyPoll(msg: DestroyPoll) {
    
  }
  
  private def handleUpdatePoll(msg: UpdatePoll) {
	if (model.updatePoll(msg.poll)) {
		outGW.send(new PollUpdatedOutMsg(meetingID, recorded, msg.poll.id, msg.poll))	  
	} else {
	  print("PollApp:: handleUpdatePoll - " + msg.poll.id + " not found" )
	}
  }

  private def handlePreCreatedPoll(msg: PreCreatedPoll) {
    model.createPoll(msg.poll)
	outGW.send(new PollCreatedOutMsg(meetingID, recorded, msg.poll.id, msg.poll)) 
  }
    
  private def handleCreatePoll(msg: CreatePoll) {
    model.createPoll(msg.poll)
	outGW.send(new PollCreatedOutMsg(meetingID, recorded, msg.poll.id, msg.poll)) 
  }
}