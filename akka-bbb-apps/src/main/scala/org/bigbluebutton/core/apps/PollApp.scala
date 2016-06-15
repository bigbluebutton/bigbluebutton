package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._
import scala.collection.mutable.HashMap
import scala.collection.mutable.ArrayBuffer
import org.bigbluebutton.common.messages.WhiteboardKeyUtil
// import org.bigbluebutton.core.service.whiteboard.WhiteboardKeyUtil
import com.google.gson.Gson
import java.util.ArrayList
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.LiveMeeting

trait PollApp {
  this: LiveMeeting =>

  val outGW: OutMessageGateway

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

      }
    }
  }

  def pollResultToWhiteboardShape(result: SimplePollResultOutVO, msg: ShowPollResultRequest): scala.collection.immutable.Map[String, Object] = {
    val shape = new scala.collection.mutable.HashMap[String, Object]()
    shape += "num_respondents" -> new Integer(result.numRespondents)
    shape += "num_responders" -> new Integer(result.numResponders)
    shape += "type" -> "poll_result"
    shape += "id" -> result.id
    shape += "status" -> "DRAW_END"

    val answers = new ArrayBuffer[java.util.HashMap[String, Object]];
    result.answers.foreach(ans => {
      val amap = new java.util.HashMap[String, Object]()
      amap.put("id", ans.id: java.lang.Integer)
      amap.put("key", ans.key)
      amap.put("num_votes", ans.numVotes: java.lang.Integer)
      answers += amap
    })

    val gson = new Gson()
    shape += "result" -> gson.toJson(answers.toArray)

    // Hardcode poll result display location for now to display result
    // in bottom-right corner.
    val display = new ArrayList[Double]()
    val shapeHeight = 6.66 * answers.size
    display.add(66.0)
    display.add(100 - shapeHeight)
    display.add(34.0)
    display.add(shapeHeight)

    shape += "points" -> display
    shape.toMap
  }

  def handleShowPollResultRequest(msg: ShowPollResultRequest) {
    pollModel.getSimplePollResult(msg.pollId) match {
      case Some(poll) => {
        pollModel.showPollResult(poll.id)
        val shape = pollResultToWhiteboardShape(poll, msg)

        for {
          page <- presModel.getCurrentPage()
          annotation = new AnnotationVO(poll.id, WhiteboardKeyUtil.DRAW_END_STATUS, WhiteboardKeyUtil.POLL_RESULT_TYPE, shape, page.id)
        } handleSendWhiteboardAnnotationRequest(new SendWhiteboardAnnotationRequest(mProps.meetingID, msg.requesterId, annotation))

        outGW.send(new PollShowResultMessage(mProps.meetingID, mProps.recorded, msg.requesterId, msg.pollId, poll))

      }
      case None => {

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

      }
    }
  }

  def handleStartCustomPollRequest(msg: StartCustomPollRequest) {
    log.debug("Received StartCustomPollRequest for pollType=[" + msg.pollType + "]")

    presModel.getCurrentPage() foreach { page =>
      val pollId = page.id + "/" + System.currentTimeMillis()

      val numRespondents = usersModel.numUsers() - 1 // subtract the presenter
      PollFactory.createPoll(pollId, msg.pollType, numRespondents, Some(msg.answers)) foreach (poll => pollModel.addPoll(poll))

      pollModel.getSimplePoll(pollId) match {
        case Some(poll) => {
          pollModel.startPoll(poll.id)
          outGW.send(new PollStartedMessage(mProps.meetingID, mProps.recorded, msg.requesterId, pollId, poll))
        }
        case None => {

        }
      }
    }
  }

  def handleStartPollRequest(msg: StartPollRequest) {
    log.debug("Received StartPollRequest for pollType=[" + msg.pollType + "]")

    presModel.getCurrentPage() foreach { page =>
      val pollId = page.id + "/" + System.currentTimeMillis()

      val numRespondents = usersModel.numUsers() - 1 // subtract the presenter
      PollFactory.createPoll(pollId, msg.pollType, numRespondents, None) foreach (poll => pollModel.addPoll(poll))

      pollModel.getSimplePoll(pollId) match {
        case Some(poll) => {
          pollModel.startPoll(poll.id)
          outGW.send(new PollStartedMessage(mProps.meetingID, mProps.recorded, msg.requesterId, pollId, poll))
        }
        case None => {

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

        }
      }
    }
  }
}