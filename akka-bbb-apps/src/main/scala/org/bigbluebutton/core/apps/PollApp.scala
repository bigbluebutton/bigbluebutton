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

  def handleGetCurrentPollRequest(msg: GetCurrentPollRequest) {
    pollModel.getCurrentPoll() match {
      case Some(p) => {
        if (p.started && p.stopped && p.showResult) {
          outGW.send(new GetCurrentPollReplyMessage(mProps.meetingID, mProps.recorded, msg.requesterId, true, Some(p)))
        } else {
          outGW.send(new GetCurrentPollReplyMessage(mProps.meetingID, mProps.recorded, msg.requesterId, false, None))
        }
      }
      case None => {
        outGW.send(new GetCurrentPollReplyMessage(mProps.meetingID, mProps.recorded, msg.requesterId, false, None))
      }
    }
  }

  def handleRespondToPollRequest(msg: RespondToPollRequest) {
    pollModel.getPoll(msg.pollId) match {
      case Some(poll) => {
        handleRespondToPoll(poll, msg)
      }
      case None => {
        val result = new RequestResult(StatusCodes.NOT_FOUND, Some(Array(ErrorCodes.RESOURCE_NOT_FOUND)))
        sender ! new RespondToPollReplyMessage(mProps.meetingID, mProps.recorded, result, msg.requesterId, msg.pollId)
      }
    }
  }

  def handleHidePollResultRequest(msg: HidePollResultRequest) {
    pollModel.getPoll(msg.pollId) match {
      case Some(poll) => {
        pollModel.hidePollResult(msg.pollId)
        outGW.send(new PollHideResultMessage(mProps.meetingID, mProps.recorded, msg.requesterId, msg.pollId, poll))
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
        pollModel.showPollResult(poll.id)
        outGW.send(new PollShowResultMessage(mProps.meetingID, mProps.recorded, msg.requesterId, msg.pollId, poll))
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
        pollModel.stopPoll(poll.id)
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
        pollModel.startPoll(poll.id)
        outGW.send(new PollStartedMessage(mProps.meetingID, mProps.recorded, msg.requesterId, msg.pollId, poll))
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

  private def handleRespondToPoll(poll: PollVO, msg: RespondToPollRequest) {
    if (hasUser(msg.requesterId)) {
      getUser(msg.requesterId) match {
        case Some(user) => {
          val responder = new Responder(user.userID, user.name)
          pollModel.respondToQuestion(poll.id, msg.questionId, msg.answerId, responder)
          outGW.send(new UserRespondedToPollMessage(mProps.meetingID, mProps.recorded, msg.requesterId, msg.pollId, poll))
        }
        case None => {
          val result = new RequestResult(StatusCodes.FORBIDDEN, Some(Array(ErrorCodes.RESOURCE_NOT_FOUND)))
          sender ! new RespondToPollReplyMessage(mProps.meetingID, mProps.recorded, result, msg.requesterId, msg.pollId)
        }
      }
    }
  }
}