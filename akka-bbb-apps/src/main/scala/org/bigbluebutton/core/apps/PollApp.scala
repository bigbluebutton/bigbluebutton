package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._

import scala.collection.mutable.HashMap
import scala.collection.mutable.ArrayBuffer
import org.bigbluebutton.common.messages.WhiteboardKeyUtil
import org.bigbluebutton.core.running.{ LiveMeeting, MeetingActor }
// import org.bigbluebutton.core.service.whiteboard.WhiteboardKeyUtil
import com.google.gson.Gson
import java.util.ArrayList
import org.bigbluebutton.core.OutMessageGateway

trait PollApp {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleGetPollRequest(msg: GetPollRequest) {

  }

  def handleGetCurrentPollRequest(msg: GetCurrentPollRequest) {

    val poll = for {
      page <- liveMeeting.presModel.getCurrentPage()
      curPoll <- liveMeeting.pollModel.getRunningPollThatStartsWith(page.id)
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
    liveMeeting.pollModel.getSimplePollResult(msg.pollId) match {
      case Some(poll) => {
        handleRespondToPoll(poll, msg)
      }
      case None => {

      }
    }
  }

  def handleHidePollResultRequest(msg: HidePollResultRequest) {
    liveMeeting.pollModel.getPoll(msg.pollId) match {
      case Some(poll) => {
        liveMeeting.pollModel.hidePollResult(msg.pollId)
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
    liveMeeting.pollModel.getSimplePollResult(msg.pollId) match {
      case Some(poll) => {
        liveMeeting.pollModel.showPollResult(poll.id)
        val shape = pollResultToWhiteboardShape(poll, msg)

        for {
          page <- liveMeeting.presModel.getCurrentPage()
          pageId = if (poll.id.contains("deskshare")) "deskshare" else page.id
          annotation = new AnnotationVO(poll.id, WhiteboardKeyUtil.DRAW_END_STATUS, WhiteboardKeyUtil.POLL_RESULT_TYPE, shape, pageId)
        } handleSendWhiteboardAnnotationRequest(new SendWhiteboardAnnotationRequest(mProps.meetingID, msg.requesterId, annotation))

        outGW.send(new PollShowResultMessage(mProps.meetingID, mProps.recorded, msg.requesterId, msg.pollId, poll))

      }
      case None => {

      }
    }
  }

  def handleStopPollRequest(msg: StopPollRequest) {
    val cpoll = for {
      page <- liveMeeting.presModel.getCurrentPage()
      curPoll <- liveMeeting.pollModel.getRunningPollThatStartsWith(page.id)
    } yield curPoll

    cpoll match {
      case Some(poll) => {
        liveMeeting.pollModel.stopPoll(poll.id)
        outGW.send(new PollStoppedMessage(mProps.meetingID, mProps.recorded, msg.requesterId, poll.id))
      }
      case None => {

      }
    }
  }

  def handleStartCustomPollRequest(msg: StartCustomPollRequest) {
    log.debug("Received StartCustomPollRequest for pollType=[" + msg.pollType + "]")

    liveMeeting.presModel.getCurrentPage() foreach { page =>
      val pageId = if (msg.pollId.contains("deskshare")) "deskshare" else page.id;

      val pollId = pageId + "/" + System.currentTimeMillis()
      log.debug("handleStartCustomPollRequest: new pollId = " + pollId);

      val numRespondents = liveMeeting.usersModel.numUsers() - 1 // subtract the presenter
      PollFactory.createPoll(pollId, msg.pollType, numRespondents, Some(msg.answers)) foreach (poll => liveMeeting.pollModel.addPoll(poll))

      liveMeeting.pollModel.getSimplePoll(pollId) match {
        case Some(poll) => {
          liveMeeting.pollModel.startPoll(poll.id)
          outGW.send(new PollStartedMessage(mProps.meetingID, mProps.recorded, msg.requesterId, pollId, poll))
        }
        case None => {

        }
      }
    }
  }

  def handleStartPollRequest(msg: StartPollRequest) {
    log.debug("Received StartPollRequest for pollType=[" + msg.pollType + "]")

    liveMeeting.presModel.getCurrentPage() foreach { page =>
      val pageId = if (msg.pollId.contains("deskshare")) "deskshare" else page.id;

      val pollId = pageId + "/" + System.currentTimeMillis()
      log.debug("handleStartPollRequest: new pollId = " + pollId);

      val numRespondents = liveMeeting.usersModel.numUsers() - 1 // subtract the presenter
      PollFactory.createPoll(pollId, msg.pollType, numRespondents, None) foreach (poll => liveMeeting.pollModel.addPoll(poll))

      liveMeeting.pollModel.getSimplePoll(pollId) match {
        case Some(poll) => {
          liveMeeting.pollModel.startPoll(poll.id)
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
          liveMeeting.pollModel.respondToQuestion(poll.id, questionId, msg.answerId, responder)
          liveMeeting.usersModel.getCurrentPresenter foreach { cp =>
            liveMeeting.pollModel.getSimplePollResult(poll.id) foreach { updatedPoll =>
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