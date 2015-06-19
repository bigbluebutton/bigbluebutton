package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._
import org.bigbluebutton.core.MeetingActor
import scala.collection.mutable.HashMap
import scala.collection.mutable.ArrayBuffer

trait PollApp {
  this: MeetingActor =>

  val outGW: MessageOutGateway

  def handleGetPollRequest(msg: GetPollRequest) {

  }

  def handleRespondToPollRequest(msg: RespondToPollRequest) {
    pollModel.getPoll(msg.pollId) match {
      case Some(poll) => {
        poll.hideResult()
        outGW.send(new PollHideResultMessage(mProps.meetingID, mProps.recorded, msg.requesterId, msg.pollId, poll.toPollVO()))
      }
      case None => {
        val result = new RequestResult(StatusCodes.NOT_FOUND, Some(Array(ErrorCodes.RESOURCE_NOT_FOUND)))
        sender ! new HidePollResultReplyMessage(mProps.meetingID, mProps.recorded, result, msg.requesterId, msg.pollId)
      }
    }
  }

  def handleHidePollResultRequest(msg: HidePollResultRequest) {
    pollModel.getPoll(msg.pollId) match {
      case Some(poll) => {
        poll.hideResult()
        outGW.send(new PollHideResultMessage(mProps.meetingID, mProps.recorded, msg.requesterId, msg.pollId, poll.toPollVO()))
      }
      case None => {
        val result = new RequestResult(StatusCodes.NOT_FOUND, Some(Array(ErrorCodes.RESOURCE_NOT_FOUND)))
        sender ! new HidePollResultReplyMessage(mProps.meetingID, mProps.recorded, result, msg.requesterId, msg.pollId)
      }
    }
  }

  def handleShowPollResultRequest(msg: ShowPollResultRequest) {
    pollModel.getPoll(msg.pollId) match {
      case Some(poll) => {
        poll.showResult()
        outGW.send(new PollShowResultMessage(mProps.meetingID, mProps.recorded, msg.requesterId, msg.pollId, poll.toPollVO()))
      }
      case None => {
        val result = new RequestResult(StatusCodes.NOT_FOUND, Some(Array(ErrorCodes.RESOURCE_NOT_FOUND)))
        sender ! new ShowPollResultReplyMessage(mProps.meetingID, mProps.recorded, result, msg.requesterId, msg.pollId)
      }
    }
  }

  def handleStopPollRequest(msg: StopPollRequest) {
    pollModel.getPoll(msg.pollId) match {
      case Some(poll) => {
        poll.stop()
        outGW.send(new PollStoppedMessage(mProps.meetingID, mProps.recorded, msg.requesterId, msg.pollId))
      }
      case None => {
        val result = new RequestResult(StatusCodes.NOT_FOUND, Some(Array(ErrorCodes.RESOURCE_NOT_FOUND)))
        sender ! new StopPollReplyMessage(mProps.meetingID, mProps.recorded, result, msg.requesterId, msg.pollId)
      }
    }
  }

  def handleStartPollRequest(msg: StartPollRequest) {
    pollModel.getPoll(msg.pollId) match {
      case Some(poll) => {
        poll.start()
        outGW.send(new PollStartedMessage(mProps.meetingID, mProps.recorded, msg.requesterId, msg.pollId, poll.toPollVO()))
      }
      case None => {
        val result = new RequestResult(StatusCodes.NOT_FOUND, Some(Array(ErrorCodes.RESOURCE_NOT_FOUND)))
        sender ! new StartPollReplyMessage(mProps.meetingID, mProps.recorded, result, msg.requesterId, msg.pollId)
      }
    }
  }

  def handleCreatePollRequest(msg: CreatePollRequest) {
    PollFactory.createPoll(msg.pollId, msg.pollType) match {
      case Some(poll) => {
        pollModel.addPoll(poll)
        outGW.send(new PollCreatedMessage(mProps.meetingID, mProps.recorded, msg.requesterId, msg.pollId, poll.toPollVO()))
      }
      case None => {
        val result = new RequestResult(StatusCodes.NOT_ACCEPTABLE, Some(Array(ErrorCodes.INVALID_DATA)))
        sender ! new CreatePollReplyMessage(mProps.meetingID, mProps.recorded, result, msg.requesterId, msg.pollId, msg.pollType)
      }
    }

  }

  private def handleRespondToPoll(poll: Poll, msg: RespondToPollRequest) {
    if (hasUser(msg.requesterId)) {
      getUser(msg.requesterId) match {
        case Some(user) => {
          val responder = new Responder(user.userID, user.name)
          poll.respondToQuestion(msg.questionId, msg.answerId, responder)

        }
        case None => //do nothing
      }
    }
  }

  /*  
  def handleHidePollResult(msg: HidePollResult) {
    val pollID = msg.pollID

    if (pollModel.hasPoll(pollID)) {
      pollModel.hidePollResult(pollID)
      outGW.send(new PollHideResultOutMsg(meetingID, recorded, pollID))
    }
  }

  def handleShowPollResult(msg: ShowPollResult) {
    val pollID = msg.pollID

    if (pollModel.hasPoll(pollID)) {
      pollModel.showPollResult(pollID)
      outGW.send(new PollShowResultOutMsg(meetingID, recorded, pollID))
    }
  }



  def handleGetPolls(msg: GetPolls) {
    var polls = pollModel.getPolls
    outGW.send(new GetPollsReplyOutMsg(meetingID, recorded, msg.requesterID, polls))
  }

  def handleClearPoll(msg: ClearPoll) {
    if (pollModel.clearPoll(msg.pollID)) {
      outGW.send(new PollClearedOutMsg(meetingID, recorded, msg.pollID))
    } else {
      print("PollApp:: handleClearPoll - " + msg.pollID + " not found")
    }
  }

  def handleStartPoll(msg: StartPoll) {
    if (pollModel.hasPoll(msg.pollID)) {
      pollModel.startPoll(msg.pollID)
      outGW.send(new PollStartedOutMsg(meetingID, recorded, msg.pollID))
    } else {
      print("PollApp:: handleStartPoll - " + msg.pollID + " not found")
    }
  }

  def handleStopPoll(msg: StopPoll) {
    if (pollModel.hasPoll(msg.pollID)) {
      pollModel.stopPoll(msg.pollID)
      outGW.send(new PollStoppedOutMsg(meetingID, recorded, msg.pollID))
    } else {
      print("PollApp:: handleStopPoll - " + msg.pollID + " not found")
    }
  }

  def handleSharePoll(msg: SharePoll) {

  }

  def handleRemovePoll(msg: RemovePoll) {
    if (pollModel.hasPoll(msg.pollID)) {
      pollModel.removePoll(msg.pollID)
      outGW.send(new PollRemovedOutMsg(meetingID, recorded, msg.pollID))
    } else {
      print("PollApp:: handleRemovePoll - " + msg.pollID + " not found")
    }
  }

  def handleDestroyPoll(msg: DestroyPoll) {

  }

  def handleUpdatePoll(msg: UpdatePoll) {
    if (pollModel.updatePoll(msg.poll)) {
      outGW.send(new PollUpdatedOutMsg(meetingID, recorded, msg.poll.id, msg.poll))
    } else {
      print("PollApp:: handleUpdatePoll - " + msg.poll.id + " not found")
    }
  }

  def handlePreCreatedPoll(msg: PreCreatedPoll) {
    pollModel.createPoll(msg.poll)
    outGW.send(new PollCreatedOutMsg(meetingID, recorded, msg.poll.id, msg.poll))
  }

  def handleCreatePoll(msg: CreatePoll) {
    pollModel.createPoll(msg.poll)
    outGW.send(new PollCreatedOutMsg(meetingID, recorded, msg.poll.id, msg.poll))
  }
  
  */
}