package org.bigbluebutton.core.models

import org.bigbluebutton.common2.domain._
import org.bigbluebutton.common2.msgs.AnnotationVO
import org.bigbluebutton.core.domain.MeetingState2x

import scala.collection.mutable.ArrayBuffer
import scala.collection.mutable.HashMap
import org.bigbluebutton.core.running.LiveMeeting

object Polls {

  def handleStartPollReqMsg(state: MeetingState2x, userId: String, pollId: String, pollType: String, secretPoll: Boolean, questionText: String,
                            multiResponse: Boolean, lm: LiveMeeting): Option[SimplePollOutVO] = {

    def createPoll(stampedPollId: String): Option[Poll] = {
      val numRespondents: Int = Users2x.numUsers(lm.users2x) - 1 // subtract the presenter

      for {
        poll <- PollFactory.createPoll(stampedPollId, pollType, multiResponse, numRespondents, None, Some(questionText), secretPoll)
      } yield {
        lm.polls.save(poll)
        poll
      }
    }

    val pollWithPresentation = for {
      pod <- state.presentationPodManager.getDefaultPod()
      pres <- pod.getCurrentPresentation()
      page <- PresentationInPod.getCurrentPage(pres)
      pageId: String = if (pollId.contains("deskshare")) "deskshare" else page.id
      stampedPollId: String = pageId + "/" + System.currentTimeMillis()

      poll <- createPoll(stampedPollId)
      simplePoll <- getSimplePoll(poll.id, lm.polls)
    } yield {
      startPoll(simplePoll.id, lm.polls)
      simplePoll
    }

    pollWithPresentation match {
      case None => {
        val stampedPollId: String = "public" + "/" + System.currentTimeMillis()
        for {
          poll <- createPoll(stampedPollId)
          simplePoll <- getSimplePoll(poll.id, lm.polls)
        } yield {
          startPoll(simplePoll.id, lm.polls)
          simplePoll
        }
      }
      case default => default
    }
  }

  def handleStopPollReqMsg(state: MeetingState2x, userId: String, lm: LiveMeeting): Option[String] = {
    var stoppedPoll = for {
      pod <- state.presentationPodManager.getDefaultPod()
      pres <- pod.getCurrentPresentation()
      page <- PresentationInPod.getCurrentPage(pres)
      curPoll <- getRunningPollThatStartsWith(page.id, lm.polls)
    } yield {
      stopPoll(curPoll.id, lm.polls)
      curPoll.id
    }

    stoppedPoll match {
      case None => {
        for {
          // Assuming there's only one running poll at a time, fallback to the
          // current running poll without indexing by a presentation page.
          curPoll <- getRunningPoll(lm.polls)
        } yield {
          stopPoll(curPoll.id, lm.polls)
          curPoll.id
        }
      }
      case default => default
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

    def send(poll: SimplePollResultOutVO, shape: scala.collection.immutable.Map[String, Object]): Option[AnnotationVO] = {
      for {
        pod <- state.presentationPodManager.getDefaultPod()
        pres <- pod.getCurrentPresentation()
        page <- PresentationInPod.getCurrentPage(pres)
      } yield {
        val pageId = if (poll.id.contains("deskshare")) "deskshare" else page.id
        val updatedShape = shape + ("whiteboardId" -> pageId)
        val annotation = new AnnotationVO(poll.id, updatedShape, pageId, requesterId)
        annotation
      }
    }

    for {
      result <- getSimplePollResult(pollId, lm.polls)
      shape = pollResultToWhiteboardShape(result)
      annot <- send(result, shape)
    } yield {
      lm.wbModel.addAnnotations(annot.wbId, requesterId, Array[AnnotationVO](annot), false, false)
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

  def handleRespondToPollReqMsg(requesterId: String, pollId: String, questionId: Int, answerIds: Seq[Int],
                                lm: LiveMeeting): Option[(String, SimplePollResultOutVO)] = {

    for {
      poll <- getSimplePollResult(pollId, lm.polls)
      pvo <- handleRespondToPoll(poll, requesterId, pollId, questionId, answerIds, lm)
    } yield {
      (pollId, pvo)
    }

  }

  def handleRespondToTypedPollReqMsg(requesterId: String, pollId: String, questionId: Int, answer: String,
                                     lm: LiveMeeting): Option[(String, SimplePollResultOutVO)] = {
    for {
      poll <- getSimplePollResult(pollId, lm.polls)
      pvo <- handleRespondToTypedPoll(poll, requesterId, pollId, questionId, answer, lm)
    } yield {
      (pollId, pvo)
    }
  }

  def handleStartCustomPollReqMsg(state: MeetingState2x, requesterId: String, pollId: String, pollType: String, secretPoll: Boolean,
                                  multiResponse: Boolean, answers: Seq[String], questionText: String, lm: LiveMeeting): Option[SimplePollOutVO] = {

    def createPoll(stampedPollId: String): Option[Poll] = {
      val numRespondents: Int = Users2x.numUsers(lm.users2x) - 1 // subtract the presenter
      for {
        poll <- PollFactory.createPoll(stampedPollId, pollType, multiResponse, numRespondents, Some(answers), Some(questionText), secretPoll)
      } yield {
        lm.polls.save(poll)
        poll
      }
    }

    val pollWithPresentation = for {
      pod <- state.presentationPodManager.getDefaultPod()
      pres <- pod.getCurrentPresentation()
      page <- PresentationInPod.getCurrentPage(pres)
      pageId: String = if (pollId.contains("deskshare")) "deskshare" else page.id
      stampedPollId: String = pageId + "/" + System.currentTimeMillis()

      poll <- createPoll(stampedPollId)
      simplePoll <- getSimplePoll(poll.id, lm.polls)
    } yield {
      startPoll(simplePoll.id, lm.polls)
      simplePoll
    }

    pollWithPresentation match {
      case None => {
        val stampedPollId: String = "public" + "/" + System.currentTimeMillis()
        for {
          poll <- createPoll(stampedPollId)
          simplePoll <- getSimplePoll(poll.id, lm.polls)
        } yield {
          startPoll(simplePoll.id, lm.polls)
          simplePoll
        }
      }
      case default => default
    }

  }

  //
  // Helper methods:
  //
  private def handleRespondToPoll(poll: SimplePollResultOutVO, requesterId: String, pollId: String, questionId: Int,
                                  answerIds: Seq[Int], lm: LiveMeeting): Option[SimplePollResultOutVO] = {
    /*
   * Hardcode to zero as we are assuming the poll has only one question.
   * Our data model supports multiple question polls but for this
   * release, we only have a simple poll which has one question per poll.
   * (ralam june 23, 2015)
   */
    val questionId = 0

    def storePollResult(responder: Responder): Option[SimplePollResultOutVO] = {
      respondToQuestion(poll.id, questionId, answerIds, responder, lm.polls)
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

  private def handleRespondToTypedPoll(poll: SimplePollResultOutVO, requesterId: String, pollId: String, questionId: Int,
                                       answer: String, lm: LiveMeeting): Option[SimplePollResultOutVO] = {

    addQuestionResponse(poll.id, questionId, answer, requesterId, lm.polls)
    for {
      updatedPoll <- getSimplePollResult(poll.id, lm.polls)
    } yield {
      updatedPoll
    }
  }

  private def pollResultToWhiteboardShape(result: SimplePollResultOutVO): scala.collection.immutable.Map[String, Object] = {
    val shape = new scala.collection.mutable.HashMap[String, Object]()
    shape += "numRespondents" -> new Integer(result.numRespondents)
    shape += "numResponders" -> new Integer(result.numResponders)
    shape += "questionType" -> result.questionType
    shape += "questionText" -> result.questionText
    shape += "id" -> result.id
    shape += "answers" -> result.answers
    shape.toMap
  }

  def getRunningPoll(polls: Polls): Option[PollVO] = {
    for {
      poll <- polls.polls.values find { poll => poll.isRunning() }
    } yield poll.toPollVO()
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

  def checkUserResponded(pollId: String, userId: String, polls: Polls): Boolean = {
    polls.polls.get(pollId) match {
      case Some(p) => {
        if (p.getResponders().filter(p => p.userId == userId).length > 0) {
          true
        } else {
          false
        }
      }
      case None => false
    }
  }

  def checkUserAddedQuestion(pollId: String, userId: String, polls: Polls): Boolean = {
    polls.polls.get(pollId) match {
      case Some(p) => {
        if (p.getTypedPollResponders().filter(responderId => responderId == userId).length > 0) {
          true
        } else {
          false
        }
      }
      case None => false
    }
  }

  def isResponsePollType(pollId: String, polls: Polls): Boolean = {
    polls.polls.get(pollId) match {
      case Some(p) => {
        if (p.questions.filter(q => q.questionType == PollType.ResponsePollType).length > 0) {
          true
        } else {
          false
        }
      }
      case None => false
    }
  }

  def showPollResult(pollId: String, polls: Polls) {
    polls.get(pollId) foreach {
      p =>
        p.showResult
        polls.currentPoll = Some(p)
    }
  }

  def respondToQuestion(pollId: String, questionID: Int, responseIDs: Seq[Int], responder: Responder, polls: Polls) {
    polls.polls.get(pollId) match {
      case Some(p) => {
        if (!p.getResponders().contains(responder)) {
          p.addResponder(responder)
          p.respondToQuestion(questionID, responseIDs, responder)
        }
      }
      case None =>
    }
  }

  def addQuestionResponse(pollId: String, questionID: Int, answer: String, requesterId: String, polls: Polls) {
    polls.polls.get(pollId) match {
      case Some(p) => {
        if (!p.getTypedPollResponders().contains(requesterId)) {
          p.addTypedPollResponder(requesterId)
          p.addQuestionResponse(questionID, answer)
        }
      }
      case None =>
    }
  }
}

object PollType {
  val YesNoPollType = "YN"
  val YesNoAbstentionPollType = "YNA"
  val TrueFalsePollType = "TF"
  val CustomPollType = "CUSTOM"
  val LetterPollType = "A-"
  val NumberPollType = "1-"
  val ResponsePollType = "R-"
}

object PollFactory {

  val LetterArray = Array("A", "B", "C", "D", "E", "F")
  val NumberArray = Array("1", "2", "3", "4", "5", "6")

  private def processYesNoPollType(qType: String, multiResponse: Boolean, text: Option[String]): Question = {
    val answers = new ArrayBuffer[Answer];

    answers += new Answer(0, "Yes", Some("Yes"))
    answers += new Answer(1, "No", Some("No"))

    new Question(0, PollType.YesNoPollType, multiResponse, text, answers)
  }

  private def processYesNoAbstentionPollType(qType: String, multiResponse: Boolean, text: Option[String]): Question = {
    val answers = new ArrayBuffer[Answer]

    answers += new Answer(0, "Yes", Some("Yes"))
    answers += new Answer(1, "No", Some("No"))
    answers += new Answer(2, "Abstention", Some("Abstention"))

    new Question(0, PollType.YesNoAbstentionPollType, multiResponse, text, answers)
  }

  private def processTrueFalsePollType(qType: String, multiResponse: Boolean, text: Option[String]): Question = {
    val answers = new ArrayBuffer[Answer];

    answers += new Answer(0, "True", Some("True"))
    answers += new Answer(1, "False", Some("False"))

    new Question(0, PollType.TrueFalsePollType, multiResponse, text, answers)
  }

  private def processLetterPollType(qType: String, multiResponse: Boolean, text: Option[String]): Option[Question] = {
    val q = qType.split('-')
    val numQs = q(1).toInt

    var questionOption: Option[Question] = None

    if (numQs > 0 && numQs <= 6) {
      val answers = new ArrayBuffer[Answer];
      for (i <- 0 until numQs) {
        answers += new Answer(i, LetterArray(i), Some(LetterArray(i)))
        val question = new Question(0, PollType.LetterPollType, multiResponse, text, answers)
        questionOption = Some(question)
      }
    }

    questionOption
  }

  private def processNumberPollType(qType: String, multiResponse: Boolean, text: Option[String]): Option[Question] = {
    val q = qType.split('-')
    val numQs = q(1).toInt

    var questionOption: Option[Question] = None

    if (numQs > 0 && numQs <= 6) {
      val answers = new ArrayBuffer[Answer];
      for (i <- 0 until numQs) {
        answers += new Answer(i, NumberArray(i), Some(NumberArray(i)))
        val question = new Question(0, PollType.NumberPollType, multiResponse, text, answers)
        questionOption = Some(question)
      }
    }
    questionOption
  }

  private def buildAnswers(answers: Seq[String]): ArrayBuffer[Answer] = {
    val ans = new ArrayBuffer[Answer]
    for (i <- 0 until answers.length) {
      ans += new Answer(i, answers(i), Some(answers(i)))
    }

    ans
  }

  private def processCustomPollType(qType: String, multiResponse: Boolean, text: Option[String], answers: Option[Seq[String]]): Option[Question] = {
    var questionOption: Option[Question] = None

    answers.foreach { ans =>
      val someAnswers = buildAnswers(ans)
      val question = new Question(0, PollType.CustomPollType, multiResponse, text, someAnswers)
      questionOption = Some(question)
    }

    questionOption
  }

  private def processResponsePollType(qType: String, text: Option[String]): Option[Question] = {
    var questionOption: Option[Question] = None

    val answers = new ArrayBuffer[Answer]
    val question = new Question(0, PollType.ResponsePollType, false, text, answers)
    questionOption = Some(question)

    questionOption
  }

  private def createQuestion(qType: String, multiResponse: Boolean, answers: Option[Seq[String]], text: Option[String]): Option[Question] = {

    val qt = qType.toUpperCase()
    var questionOption: Option[Question] = None

    if (qt.matches(PollType.YesNoPollType)) {
      questionOption = Some(processYesNoPollType(qt, multiResponse, text))
    } else if (qt.matches(PollType.YesNoAbstentionPollType)) {
      questionOption = Some(processYesNoAbstentionPollType(qt, multiResponse, text))
    } else if (qt.matches(PollType.TrueFalsePollType)) {
      questionOption = Some(processTrueFalsePollType(qt, multiResponse, text))
    } else if (qt.matches(PollType.CustomPollType)) {
      questionOption = processCustomPollType(qt, multiResponse, text, answers)
    } else if (qt.startsWith(PollType.LetterPollType)) {
      questionOption = processLetterPollType(qt, multiResponse, text)
    } else if (qt.startsWith(PollType.NumberPollType)) {
      questionOption = processNumberPollType(qt, multiResponse, text)
    } else if (qt.startsWith(PollType.ResponsePollType)) {
      questionOption = processResponsePollType(qt, text)
    }

    questionOption
  }

  def createPoll(id: String, pollType: String, multiResponse: Boolean, numRespondents: Int, answers: Option[Seq[String]], questionText: Option[String], isSecret: Boolean): Option[Poll] = {
    var poll: Option[Poll] = None

    createQuestion(pollType, multiResponse, answers, questionText) match {
      case Some(question) => {
        poll = Some(new Poll(id, Array(question), numRespondents, None, isSecret))
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

class Poll(val id: String, val questions: Array[Question], val numRespondents: Int, val title: Option[String], val isSecret: Boolean) {
  private var _started: Boolean = false
  private var _stopped: Boolean = false
  private var _showResult: Boolean = false
  private var _numResponders: Int = 0
  private var _responders = new ArrayBuffer[Responder]()
  private var _respondersTypedPoll = new ArrayBuffer[String]()

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
  def addTypedPollResponder(responderId: String) { _respondersTypedPoll += (responderId) }
  def getTypedPollResponders(): ArrayBuffer[String] = { return _respondersTypedPoll }

  def hasResponses(): Boolean = {
    questions.foreach(q => {
      if (q.hasResponders) return true
    })

    return false
  }

  def respondToQuestion(questionID: Int, responseIDs: Seq[Int], responder: Responder) {
    questions.foreach(q => {
      if (q.id == questionID) {
        q.respondToQuestion(responseIDs, responder)
        _numResponders += 1
      }
    })
  }

  def addQuestionResponse(questionID: Int, answer: String) {
    questions.foreach(q => {
      if (q.id == questionID) {
        q.addQuestionResponse(answer)
      }
    })
  }

  def toPollVO(): PollVO = {
    val qvos = new ArrayBuffer[QuestionVO]
    questions.foreach(q => {
      qvos += q.toQuestionVO
    })

    new PollVO(id, qvos.toArray, title, _started, _stopped, _showResult, isSecret)
  }

  def toSimplePollOutVO(): SimplePollOutVO = {
    new SimplePollOutVO(id, questions(0).multiResponse, questions(0).toSimpleAnswerOutVO())
  }

  def toSimplePollResultOutVO(): SimplePollResultOutVO = {
    new SimplePollResultOutVO(id, questions(0).questionType, questions(0).text, questions(0).toSimpleVotesOutVO(), numRespondents, _numResponders)
  }
}

class Question(val id: Int, val questionType: String, val multiResponse: Boolean, val text: Option[String], val answers: ArrayBuffer[Answer]) {
  def addAnswer(text: String) {
    answers += new Answer(answers.size, text, Some(text))
  }

  def clear() {
    answers.foreach(r => r.clear)
  }

  def hasResponders(): Boolean = {
    answers.foreach(r => {
      if (r.numResponders > 0) return true
    })

    return false
  }

  def respondToQuestion(ids: Seq[Int], responder: Responder) {
    answers.foreach(r => {
      if (ids.contains(r.id)) r.addResponder(responder)
    })
  }

  def addQuestionResponse(answer: String) {
    addAnswer(answer)
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
