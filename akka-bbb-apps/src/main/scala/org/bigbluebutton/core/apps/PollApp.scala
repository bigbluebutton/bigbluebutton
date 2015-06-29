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

    val poll = for {
      page <- presModel.getCurrentPage()
      curPoll <- pollModel.getRunningPollThatStartsWith(page.id)
    } yield curPoll

    poll match {
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
    pollModel.getSimplePollResult(msg.pollId) match {
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
        outGW.send(new PollHideResultMessage(mProps.meetingID, mProps.recorded, msg.requesterId, msg.pollId))
      }
      case None => {
        val result = new RequestResult(StatusCodes.NOT_FOUND, Some(Array(ErrorCodes.RESOURCE_NOT_FOUND)))
        sender ! new HidePollResultReplyMessage(mProps.meetingID, mProps.recorded, result, msg.requesterId, msg.pollId)
      }
    }
  }

  def handleShowPollResultRequest(msg: ShowPollResultRequest) {
    pollModel.getSimplePollResult(msg.pollId) match {
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
    val cpoll = for {
      page <- presModel.getCurrentPage()
      curPoll <- pollModel.getRunningPollThatStartsWith(page.id)
    } yield curPoll

    cpoll match {
      case Some(poll) => {
        pollModel.stopPoll(poll.id)
        outGW.send(new PollStoppedMessage(mProps.meetingID, mProps.recorded, msg.requesterId, poll.id))
      }
      case None => {
        val result = new RequestResult(StatusCodes.NOT_FOUND, Some(Array(ErrorCodes.RESOURCE_NOT_FOUND)))
        sender ! new StopPollReplyMessage(mProps.meetingID, mProps.recorded, result, msg.requesterId)
      }
    }
  }

  def handleStartPollRequest(msg: StartPollRequest) {
    log.debug("Received StartPollRequest for pollType=[" + msg.pollType + "]")

    presModel.getCurrentPage() foreach { page =>
      val pollId = page.id + "/" + System.currentTimeMillis()

      PollFactory.createPoll(pollId, msg.pollType) foreach (poll => pollModel.addPoll(poll))

      pollModel.getSimplePoll(pollId) match {
        case Some(poll) => {
          pollModel.startPoll(poll.id)
          outGW.send(new PollStartedMessage(mProps.meetingID, mProps.recorded, msg.requesterId, pollId, poll))
        }
        case None => {
          val result = new RequestResult(StatusCodes.NOT_FOUND, Some(Array(ErrorCodes.RESOURCE_NOT_FOUND)))
          sender ! new StartPollReplyMessage(mProps.meetingID, mProps.recorded, result, msg.requesterId, pollId)
        }
      }
    }

  }

  private def handleRespondToPoll(poll: SimplePollResultOutVO, msg: RespondToPollRequest) {
    if (hasUser(msg.requesterId)) {
      getUser(msg.requesterId) match {
        case Some(user) => {
          val responder = new Responder(user.userID, user.name)
          /*
           * Hardcode to zero as we are assuming the poll has only one question. 
           * Our data model supports multiple question polls but for this
           * release, we only have a simple poll which has one question per poll.
           * (ralam june 23, 2015)
           */
          val questionId = 0
          pollModel.respondToQuestion(poll.id, questionId, msg.answerId, responder)
          usersModel.getCurrentPresenter foreach { cp =>
            pollModel.getSimplePollResult(poll.id) foreach { updatedPoll =>
              outGW.send(new UserRespondedToPollMessage(mProps.meetingID, mProps.recorded, cp.userID, msg.pollId, updatedPoll))
            }

          }

        }
        case None => {
          val result = new RequestResult(StatusCodes.FORBIDDEN, Some(Array(ErrorCodes.RESOURCE_NOT_FOUND)))
          sender ! new RespondToPollReplyMessage(mProps.meetingID, mProps.recorded, result, msg.requesterId, msg.pollId)
        }
      }
    }
  }
}