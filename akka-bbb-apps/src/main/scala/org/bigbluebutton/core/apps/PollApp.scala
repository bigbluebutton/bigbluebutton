package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._

import scala.collection.mutable.ArrayBuffer
import org.bigbluebutton.core.running.MeetingActor
import com.google.gson.Gson
import java.util.ArrayList

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models.Users2x

trait PollApp {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleGetPollRequest(msg: GetPollRequest) {

  }

  def handleGetCurrentPollRequest(msg: GetCurrentPollRequest) {

    val poll = for {
      page <- liveMeeting.presModel.getCurrentPage()
      curPoll <- PollModel.getRunningPollThatStartsWith(page.id, liveMeeting.pollModel)
    } yield curPoll

    poll match {
      case Some(p) => {
        if (p.started && p.stopped && p.showResult) {
          outGW.send(new GetCurrentPollReplyMessage(props.meetingProp.intId, props.recordProp.record, msg.requesterId, true, Some(p)))
        } else {
          outGW.send(new GetCurrentPollReplyMessage(props.meetingProp.intId, props.recordProp.record, msg.requesterId, false, None))
        }
      }
      case None => {
        outGW.send(new GetCurrentPollReplyMessage(props.meetingProp.intId, props.recordProp.record, msg.requesterId, false, None))
      }
    }
  }

  def handleRespondToPollRequest(msg: RespondToPollRequest) {
    for {
      poll <- PollModel.getSimplePollResult(msg.pollId, liveMeeting.pollModel)
    } yield handleRespondToPoll(poll, msg)
  }

  def handleHidePollResultRequest(msg: HidePollResultRequest) {
    for {
      poll <- PollModel.getPoll(msg.pollId, liveMeeting.pollModel)
    } yield {
      PollModel.hidePollResult(msg.pollId, liveMeeting.pollModel)
      outGW.send(new PollHideResultMessage(props.meetingProp.intId, props.recordProp.record, msg.requesterId, msg.pollId))
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
    def send(poll: SimplePollResultOutVO, shape: scala.collection.immutable.Map[String, Object]): Unit = {
      /*
      for {
        page <- liveMeeting.presModel.getCurrentPage()
        pageId = if (poll.id.contains("deskshare")) "deskshare" else page.id
        annotation = new AnnotationProps(poll.id, WhiteboardKeyUtil.DRAW_END_STATUS, WhiteboardKeyUtil.POLL_RESULT_TYPE, shape, page.id, msg.requesterId, -1)
      } handleSendWhiteboardAnnotationRequest(new SendWhiteboardAnnotationRequest(props.meetingProp.intId, msg.requesterId, annotation))
      */
    }

    for {
      poll <- PollModel.getSimplePollResult(msg.pollId, liveMeeting.pollModel)
      shape = pollResultToWhiteboardShape(poll, msg)
    } yield {
      send(poll, shape)
      PollModel.showPollResult(msg.pollId, liveMeeting.pollModel)
      outGW.send(new PollShowResultMessage(props.meetingProp.intId, props.recordProp.record, msg.requesterId, msg.pollId, poll))
    }
  }

  def handleStopPollRequest(msg: StopPollRequest) {
    for {
      page <- liveMeeting.presModel.getCurrentPage()
      curPoll <- PollModel.getRunningPollThatStartsWith(page.id, liveMeeting.pollModel)
    } yield {
      PollModel.stopPoll(curPoll.id, liveMeeting.pollModel)
      outGW.send(new PollStoppedMessage(props.meetingProp.intId, props.recordProp.record, msg.requesterId, curPoll.id))
    }
  }

  def handleStartCustomPollRequest(msg: StartCustomPollRequest) {
    log.debug("Received StartCustomPollRequest for pollType=[" + msg.pollType + "]")

    def createPoll(pollId: String, numRespondents: Int): Option[Poll] = {
      for {
        poll <- PollFactory.createPoll(pollId, msg.pollType, numRespondents, Some(msg.answers))
      } yield {
        PollModel.addPoll(poll, liveMeeting.pollModel)
        poll
      }
    }

    for {
      page <- liveMeeting.presModel.getCurrentPage()
      pageId = if (msg.pollId.contains("deskshare")) "deskshare" else page.id;
      pollId = pageId + "/" + System.currentTimeMillis()
      numRespondents = Users2x.numUsers(liveMeeting.users2x) - 1 // subtract the presenter
      poll <- createPoll(pollId, numRespondents)
      simplePoll <- PollModel.getSimplePoll(pollId, liveMeeting.pollModel)
    } yield {
      PollModel.startPoll(poll.id, liveMeeting.pollModel)
      outGW.send(new PollStartedMessage(props.meetingProp.intId, props.recordProp.record, msg.requesterId, pollId, simplePoll))
    }
  }

  def handleStartPollRequest(msg: StartPollRequest) {
    log.debug("Received StartPollRequest for pollType=[" + msg.pollType + "]")
    def createPoll(pollId: String, numRespondents: Int): Option[Poll] = {
      for {
        poll <- PollFactory.createPoll(pollId, msg.pollType, numRespondents, None)
      } yield {
        PollModel.addPoll(poll, liveMeeting.pollModel)
        poll
      }
    }

    for {
      page <- liveMeeting.presModel.getCurrentPage()
      pageId = if (msg.pollId.contains("deskshare")) "deskshare" else page.id
      pollId = pageId + "/" + System.currentTimeMillis()
      numRespondents = Users2x.numUsers(liveMeeting.users2x) - 1 // subtract the presenter
      poll <- createPoll(pollId, numRespondents)
      simplePoll <- PollModel.getSimplePoll(pollId, liveMeeting.pollModel)
    } yield {
      PollModel.startPoll(poll.id, liveMeeting.pollModel)
      outGW.send(new PollStartedMessage(props.meetingProp.intId, props.recordProp.record, msg.requesterId, pollId, simplePoll))
    }

  }

  private def handleRespondToPoll(poll: SimplePollResultOutVO, msg: RespondToPollRequest) {
    /*
   * Hardcode to zero as we are assuming the poll has only one question.
   * Our data model supports multiple question polls but for this
   * release, we only have a simple poll which has one question per poll.
   * (ralam june 23, 2015)
   */
    val questionId = 0

    def storePollResult(responder: Responder): Option[SimplePollResultOutVO] = {
      PollModel.respondToQuestion(poll.id, questionId, msg.answerId, responder, liveMeeting.pollModel)
      for {
        updatedPoll <- PollModel.getSimplePollResult(poll.id, liveMeeting.pollModel)
      } yield updatedPoll

    }

    for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, msg.requesterId)
      responder = new Responder(user.intId, user.name)
      updatedPoll <- storePollResult(responder)
      curPres <- Users2x.findPresenter(liveMeeting.users2x)
    } yield outGW.send(new UserRespondedToPollMessage(props.meetingProp.intId, props.recordProp.record, curPres.intId, msg.pollId, updatedPoll))

  }
}
