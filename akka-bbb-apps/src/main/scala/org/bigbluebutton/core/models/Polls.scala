package org.bigbluebutton.core.models

import org.bigbluebutton.common2.domain._
import org.bigbluebutton.common2.msgs.AnnotationVO
import org.bigbluebutton.core.apps.WhiteboardKeyUtil
import org.bigbluebutton.core.domain.MeetingState2x

import scala.collection.mutable.ArrayBuffer
import scala.collection.mutable.HashMap
import org.bigbluebutton.core.running.LiveMeeting

object Polls {

  def handleStartPollReqMsg(state: MeetingState2x, userId: String, pollId: String, pollType: String,
                            lm: LiveMeeting): Option[SimplePollOutVO] = {
    def createPoll(pollId: String, numRespondents: Int): Option[Poll] = {
      for {
        poll <- PollFactory.createPoll(pollId, pollType, numRespondents, None)
      } yield {
        lm.polls.save(poll)
        poll
      }
    }

    for {
      pod <- state.presentationPodManager.getDefaultPod()
      pres <- pod.getCurrentPresentation()
      page <- PresentationInPod.getCurrentPage(pres)
      pageId: String = if (pollId.contains("deskshare")) "deskshare" else page.id
      stampedPollId: String = pageId + "/" + System.currentTimeMillis()
      numRespondents: Int = Users2x.numUsers(lm.users2x) - 1 // subtract the presenter

      poll <- createPoll(stampedPollId, numRespondents)
      simplePoll <- getSimplePoll(poll.id, lm.polls)
    } yield {
      startPoll(simplePoll.id, lm.polls)
      simplePoll
    }
  }

  def handleStopPollReqMsg(state: MeetingState2x, userId: String, lm: LiveMeeting): Option[String] = {
    for {
      pod <- state.presentationPodManager.getDefaultPod()
      pres <- pod.getCurrentPresentation()
      page <- PresentationInPod.getCurrentPage(pres)
      curPoll <- getRunningPollThatStartsWith(page.id, lm.polls)
    } yield {
      stopPoll(curPoll.id, lm.polls)
      curPoll.id
    }
  }

  def handleShowPollResultReqMsg(state: MeetingState2x, requesterId: String, pollId: String, lm: LiveMeeting): Option[(SimplePollResultOutVO, AnnotationVO)] = {
    def sanitizeAnnotation(annotation: AnnotationVO): AnnotationVO = {
      // Remove null values by wrapping value with Option
      val shape = annotation.annotationInfo.collect {
        case (key, value: Any) => key -> Option(value)
      }

      // Unwrap the value wrapped as Option
      val shape2 = shape.collect {
        case (key, Some(value)) => key -> value
      }

      annotation.copy(annotationInfo = shape2)
    }

    def updateWhiteboardAnnotation(annotation: AnnotationVO): AnnotationVO = {
      lm.wbModel.updateAnnotation(annotation.wbId, annotation.userId, annotation)
    }

    def send(poll: SimplePollResultOutVO, shape: scala.collection.immutable.Map[String, Object]): Option[AnnotationVO] = {
      for {
        pod <- state.presentationPodManager.getDefaultPod()
        pres <- pod.getCurrentPresentation()
        page <- PresentationInPod.getCurrentPage(pres)
      } yield {
        val pageId = if (poll.id.contains("deskshare")) "deskshare" else page.id
        val updatedShape = shape + ("whiteboardId" -> pageId)
        val annotation = new AnnotationVO(poll.id, WhiteboardKeyUtil.DRAW_END_STATUS,
          WhiteboardKeyUtil.POLL_RESULT_TYPE, updatedShape, pageId, requesterId, -1)
        val sanitizedShape = sanitizeAnnotation(annotation)
        updateWhiteboardAnnotation(sanitizedShape)
      }
    }

    for {
      result <- getSimplePollResult(pollId, lm.polls)
      shape = pollResultToWhiteboardShape(result)
      annot <- send(result, shape)
    } yield {
      showPollResult(pollId, lm.polls)
      (result, annot)
    }
  }

  def handleGetCurrentPollReqMsg(state: MeetingState2x, requesterId: String, lm: LiveMeeting): Option[PollVO] = {
    val poll = for {
      pod <- state.presentationPodManager.getDefaultPod()
      pres <- pod.getCurrentPresentation()
      page <- PresentationInPod.getCurrentPage(pres)
      curPoll <- getRunningPollThatStartsWith(page.id, lm.polls)
    } yield curPoll

    poll match {
      case Some(p) => {
        if (p.started && p.stopped && p.showResult) {
          Some(p)
        } else {
          None
        }
      }
      case None => {
        None
      }
    }
  }

  def handleRespondToPollReqMsg(requesterId: String, pollId: String, questionId: Int, answerId: Int,
                                lm: LiveMeeting): Option[(String, SimplePollResultOutVO)] = {

    for {
      poll <- getSimplePollResult(pollId, lm.polls)
      pvo <- handleRespondToPoll(poll, requesterId, pollId, questionId, answerId, lm)
    } yield {
      (pollId, pvo)
    }

  }

  def handleStartCustomPollReqMsg(state: MeetingState2x, requesterId: String, pollId: String, pollType: String,
                                  answers: Seq[String], lm: LiveMeeting): Option[SimplePollOutVO] = {

    def createPoll(pollId: String, numRespondents: Int): Option[Poll] = {
      for {
        poll <- PollFactory.createPoll(pollId, pollType, numRespondents, Some(answers))
      } yield {
        lm.polls.save(poll)
        poll
      }
    }

    for {
      pod <- state.presentationPodManager.getDefaultPod()
      pres <- pod.getCurrentPresentation()
      page <- PresentationInPod.getCurrentPage(pres)
      pageId: String = if (pollId.contains("deskshare")) "deskshare" else page.id
      stampedPollId: String = pageId + "/" + System.currentTimeMillis()
      numRespondents: Int = Users2x.numUsers(lm.users2x) - 1 // subtract the presenter
      poll <- createPoll(stampedPollId, numRespondents)
      simplePoll <- getSimplePoll(stampedPollId, lm.polls)
    } yield {
      startPoll(poll.id, lm.polls)
      simplePoll
    }
  }

  //
  // Helper methods:
  //
  private def handleRespondToPoll(poll: SimplePollResultOutVO, requesterId: String, pollId: String, questionId: Int,
                                  answerId: Int, lm: LiveMeeting): Option[SimplePollResultOutVO] = {
    /*
   * Hardcode to zero as we are assuming the poll has only one question.
   * Our data model supports multiple question polls but for this
   * release, we only have a simple poll which has one question per poll.
   * (ralam june 23, 2015)
   */
    val questionId = 0

    def storePollResult(responder: Responder): Option[SimplePollResultOutVO] = {
      respondToQuestion(poll.id, questionId, answerId, responder, lm.polls)
      for {
        updatedPoll <- getSimplePollResult(poll.id, lm.polls)
      } yield updatedPoll

    }

    for {
      user <- Users2x.findWithIntId(lm.users2x, requesterId)
      responder = new Responder(user.intId, user.name)
      updatedPoll <- storePollResult(responder)
    } yield {
      updatedPoll
    }

  }

  private def pollResultToWhiteboardShape(result: SimplePollResultOutVO): scala.collection.immutable.Map[String, Object] = {
    val shape = new scala.collection.mutable.HashMap[String, Object]()
    shape += "numRespondents" -> new Integer(result.numRespondents)
    shape += "numResponders" -> new Integer(result.numResponders)
    shape += "type" -> WhiteboardKeyUtil.POLL_RESULT_TYPE
    shape += "id" -> result.id
    shape += "status" -> WhiteboardKeyUtil.DRAW_END_STATUS

    val answers = new ArrayBuffer[SimpleVoteOutVO]
    result.answers.foreach(ans => {
      answers += SimpleVoteOutVO(ans.id, ans.key, ans.numVotes)
    })

    shape += "result" -> answers

    // Hardcode poll result display location for now to display result
    // in bottom-right corner.
    val shapeHeight = 6.66 * answers.size
    val mapA = List(66.toFloat, 100 - shapeHeight, 34.toFloat, shapeHeight)

    shape += "points" -> mapA
    shape.toMap
  }

  def getRunningPollThatStartsWith(pollId: String, polls: Polls): Option[PollVO] = {
    for {
      poll <- polls.polls.values find { poll => poll.id.startsWith(pollId) && poll.isRunning() }
    } yield poll.toPollVO()

  }
  //
  //  def numPolls(polls: Polls): Int = {
  //    polls.size
  //  }
  //
  //  def addPoll(poll: Poll, model: PollModel) {
  //    model.polls += poll.id -> poll
  //  }
  //
  //  def hasCurrentPoll(model: PollModel): Boolean = {
  //    model.currentPoll != None
  //  }
  //
  //  def getCurrentPoll(model: PollModel): Option[PollVO] = {
  //    model.currentPoll
  //  }

  def getPolls(polls: Polls): Array[PollVO] = {
    val poll = new ArrayBuffer[PollVO]
    polls.polls.values.foreach(p => {
      poll += p.toPollVO()
    })

    poll.toArray
  }

  //  def clearPoll(pollID: String, model: PollModel): Boolean = {
  //    var success = false
  //    model.polls.get(pollID) match {
  //      case Some(p) => {
  //        p.clear
  //        success = true
  //      }
  //      case None => success = false
  //    }
  //
  //    success
  //  }
  //
  def startPoll(pollId: String, polls: Polls) {
    polls.get(pollId) foreach {
      p =>
        p.start()
        polls.currentPoll = Some(p)
    }
  }
  //
  //  def removePoll(pollID: String, model: PollModel): Boolean = {
  //    var success = false
  //    model.polls.get(pollID) match {
  //      case Some(p) => {
  //        model.polls -= p.id
  //        success = true
  //      }
  //      case None => success = false
  //    }
  //
  //    success
  //  }
  //
  def stopPoll(pollId: String, polls: Polls) {
    polls.get(pollId) foreach (p => p.stop())
  }

  //  def hasPoll(pollId: String, model: PollModel): Boolean = {
  //    model.polls.get(pollId) != None
  //  }
  //
  def getSimplePoll(pollId: String, polls: Polls): Option[SimplePollOutVO] = {
    var pvo: Option[SimplePollOutVO] = None
    polls.get(pollId) foreach (p => pvo = Some(p.toSimplePollOutVO()))
    pvo
  }

  def getSimplePollResult(pollId: String, polls: Polls): Option[SimplePollResultOutVO] = {
    var pvo: Option[SimplePollResultOutVO] = None
    polls.get(pollId) foreach (p => pvo = Some(p.toSimplePollResultOutVO()))
    pvo
  }

  def getPoll(pollId: String, polls: Polls): Option[PollVO] = {
    var pvo: Option[PollVO] = None
    polls.get(pollId) foreach (p => pvo = Some(p.toPollVO()))
    pvo
  }

  def showPollResult(pollId: String, polls: Polls) {
    polls.get(pollId) foreach {
      p =>
        p.showResult
        polls.currentPoll = Some(p)
    }
  }

  def respondToQuestion(pollId: String, questionID: Int, responseID: Int, responder: Responder, polls: Polls) {
    polls.polls.get(pollId) match {
      case Some(p) => {
        if (!p.getResponders().exists(_ == responder)) {
          p.addResponder(responder)
          p.respondToQuestion(questionID, responseID, responder)
        }
      }
      case None =>
    }
  }

}

object PollType {
  val YesNoPollType = "YN"
  val TrueFalsePollType = "TF"
  val CustomPollType = "CUSTOM"
  val LetterPollType = "A-"
  val NumberPollType = "1-"
}

object PollFactory {

  val LetterArray = Array("A", "B", "C", "D", "E", "F")
  val NumberArray = Array("1", "2", "3", "4", "5", "6")

  private def processYesNoPollType(qType: String): Question = {
    val answers = new Array[Answer](2)

    answers(0) = new Answer(0, "Yes", Some("Yes"))
    answers(1) = new Answer(1, "No", Some("No"))

    new Question(0, PollType.YesNoPollType, false, None, answers)
  }

  private def processTrueFalsePollType(qType: String): Question = {
    val answers = new Array[Answer](2)

    answers(0) = new Answer(0, "True", Some("True"))
    answers(1) = new Answer(1, "False", Some("False"))

    new Question(0, PollType.TrueFalsePollType, false, None, answers)
  }

  private def processLetterPollType(qType: String, multiResponse: Boolean): Option[Question] = {
    val q = qType.split('-')
    val numQs = q(1).toInt

    var questionOption: Option[Question] = None

    if (numQs > 0 && numQs <= 6) {
      val answers = new Array[Answer](numQs)

      for (i <- 0 until numQs) {
        answers(i) = new Answer(i, LetterArray(i), Some(LetterArray(i)))
        val question = new Question(0, PollType.LetterPollType, multiResponse, None, answers)
        questionOption = Some(question)
      }
    }

    questionOption
  }

  private def processNumberPollType(qType: String, multiResponse: Boolean): Option[Question] = {
    val q = qType.split('-')
    val numQs = q(1).toInt

    var questionOption: Option[Question] = None

    if (numQs > 0 && numQs <= 6) {
      val answers = new Array[Answer](numQs)
      for (i <- 0 until numQs) {
        answers(i) = new Answer(i, NumberArray(i), Some(NumberArray(i)))
        val question = new Question(0, PollType.NumberPollType, multiResponse, None, answers)
        questionOption = Some(question)
      }
    }
    questionOption
  }

  private def buildAnswers(answers: Seq[String]): Array[Answer] = {
    val ans = new Array[Answer](answers.length)
    for (i <- 0 until answers.length) {
      ans(i) = new Answer(i, answers(i), Some(answers(i)))
    }

    ans
  }

  private def processCustomPollType(qType: String, multiResponse: Boolean, answers: Option[Seq[String]]): Option[Question] = {
    var questionOption: Option[Question] = None

    answers.foreach { ans =>
      val someAnswers = buildAnswers(ans)
      val question = new Question(0, PollType.CustomPollType, multiResponse, None, someAnswers)
      questionOption = Some(question)
    }

    questionOption
  }

  private def createQuestion(qType: String, answers: Option[Seq[String]]): Option[Question] = {

    val qt = qType.toUpperCase()
    var questionOption: Option[Question] = None

    if (qt.matches(PollType.YesNoPollType)) {
      questionOption = Some(processYesNoPollType(qt))
    } else if (qt.matches(PollType.TrueFalsePollType)) {
      questionOption = Some(processTrueFalsePollType(qt))
    } else if (qt.matches(PollType.CustomPollType)) {
      questionOption = processCustomPollType(qt, false, answers)
    } else if (qt.startsWith(PollType.LetterPollType)) {
      questionOption = processLetterPollType(qt, false)
    } else if (qt.startsWith(PollType.NumberPollType)) {
      questionOption = processNumberPollType(qt, false)
    }

    questionOption
  }

  def createPoll(id: String, pollType: String, numRespondents: Int, answers: Option[Seq[String]]): Option[Poll] = {
    var poll: Option[Poll] = None

    createQuestion(pollType, answers) match {
      case Some(question) => {
        poll = Some(new Poll(id, Array(question), numRespondents, None))
      }
      case None => poll = None
    }

    poll
  }
}

case class QuestionResponsesVO(val questionID: String, val responseIDs: Array[String])
case class PollResponseVO(val pollID: String, val responses: Array[QuestionResponsesVO])
case class ResponderVO(responseID: String, user: Responder)

case class ResponseOutVO(id: String, text: String, responders: Array[Responder] = Array[Responder]())
case class QuestionOutVO(id: String, multiResponse: Boolean, question: String, responses: Array[ResponseOutVO])

class Poll(val id: String, val questions: Array[Question], val numRespondents: Int, val title: Option[String]) {
  private var _started: Boolean = false
  private var _stopped: Boolean = false
  private var _showResult: Boolean = false
  private var _numResponders: Int = 0
  private var _responders = new ArrayBuffer[Responder]()

  def showingResult() { _showResult = true }
  def showResult(): Boolean = { _showResult }
  def start() { _started = true }
  def stop() { _stopped = true }
  def isStarted(): Boolean = { return _started }
  def isStopped(): Boolean = { return _stopped }
  def isRunning(): Boolean = { return isStarted() && !isStopped() }
  def clear() {
    questions.foreach(q => { q.clear })
    _started = false
    _stopped = false
  }

  def addResponder(responder: Responder) { _responders += (responder) }
  def getResponders(): ArrayBuffer[Responder] = { return _responders }

  def hasResponses(): Boolean = {
    questions.foreach(q => {
      if (q.hasResponders) return true
    })

    return false
  }

  def respondToQuestion(questionID: Int, responseID: Int, responder: Responder) {
    questions.foreach(q => {
      if (q.id == questionID) {
        q.respondToQuestion(responseID, responder)
        _numResponders += 1
      }
    })
  }

  def toPollVO(): PollVO = {
    val qvos = new ArrayBuffer[QuestionVO]
    questions.foreach(q => {
      qvos += q.toQuestionVO
    })

    new PollVO(id, qvos.toArray, title, _started, _stopped, _showResult)
  }

  def toSimplePollOutVO(): SimplePollOutVO = {
    new SimplePollOutVO(id, questions(0).toSimpleAnswerOutVO())
  }

  def toSimplePollResultOutVO(): SimplePollResultOutVO = {
    new SimplePollResultOutVO(id, questions(0).toSimpleVotesOutVO(), numRespondents, _numResponders)
  }
}

class Question(val id: Int, val questionType: String, val multiResponse: Boolean, val text: Option[String], val answers: Array[Answer]) {

  def clear() {
    answers.foreach(r => r.clear)
  }

  def hasResponders(): Boolean = {
    answers.foreach(r => {
      if (r.numResponders > 0) return true
    })

    return false
  }

  def respondToQuestion(id: Int, responder: Responder) {
    answers.foreach(r => {
      if (r.id == id) r.addResponder(responder)
    })
  }

  def toQuestionVO(): QuestionVO = {
    val rvos = new ArrayBuffer[AnswerVO]
    answers.foreach(answer => {
      val r = new AnswerVO(answer.id, answer.key, answer.text, Some(answer.getResponders))
      rvos += r
    })

    new QuestionVO(id, questionType, multiResponse, text, Some(rvos.toArray))
  }

  def toSimpleAnswerOutVO(): Array[SimpleAnswerOutVO] = {
    val rvos = new ArrayBuffer[SimpleAnswerOutVO]
    answers.foreach(answer => {
      rvos += answer.toSimpleAnswerOutVO()
    })

    rvos.toArray
  }

  def toSimpleVotesOutVO(): Array[SimpleVoteOutVO] = {
    val rvos = new ArrayBuffer[SimpleVoteOutVO]
    answers.foreach(answer => {
      rvos += answer.toSimpleVoteOutVO()
    })

    rvos.toArray
  }
}

class Answer(val id: Int, val key: String, val text: Option[String]) {

  val responders = new ArrayBuffer[Responder]()

  def clear() {
    responders.clear
  }
  def addResponder(responder: Responder) {
    responders += responder
  }

  def numResponders(): Int = {
    responders.length
  }

  def getResponders(): Array[Responder] = {
    return responders.toArray
  }

  def toSimpleAnswerOutVO(): SimpleAnswerOutVO = {
    new SimpleAnswerOutVO(id, key)
  }

  def toSimpleVoteOutVO(): SimpleVoteOutVO = {
    new SimpleVoteOutVO(id, key, numResponders)
  }
}

class Polls {
  private val polls = new HashMap[String, Poll]()
  private var currentPoll: Option[Poll] = None

  private def save(poll: Poll): Poll = {
    polls += poll.id -> poll
    poll
  }

  /*
  private def remove(id: String): Option[Poll] = {
    val poll = polls.get(id)
    poll foreach (p => polls -= id)
    poll
  }
  */

  private def get(id: String): Option[Poll] = {
    polls.get(id)
  }

}
