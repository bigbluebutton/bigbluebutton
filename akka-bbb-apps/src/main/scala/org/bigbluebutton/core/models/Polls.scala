package org.bigbluebutton.core.models

import scala.collection.mutable.ArrayBuffer
import scala.collection.mutable.HashMap
import org.bigbluebutton.core.running.{ LiveMeeting, MeetingActor }

object Polls {

  def handleStartPollReqMsg(userId: String, pollId: String, pollType: String, lm: LiveMeeting): Option[Poll] = {

    //    log.debug("Received StartPollRequest for pollType=[" + pollType + "]")
    println("Received StartPollReqMsg for pollType=[" + pollType + "]")
    def createPoll(pollId: String, numRespondents: Int): Option[Poll] = {
      for {
        poll <- PollFactory.createPoll(pollId, pollType, numRespondents, None)
      } yield {
        lm.polls.save(poll)
        poll
      }
    }

    for {
      page <- lm.presModel.getCurrentPage()
      pageId: String = if (pollId.contains("deskshare")) "deskshare" else page.id
      // pollId: String = pageId + "/" + System.currentTimeMillis()
      numRespondents: Int = Users.numUsers(lm.users) - 1 // subtract the presenter

      poll <- createPoll(pollId, numRespondents)
      simplePoll <- getSimplePoll(pollId, lm.polls)
    } yield {
      startPoll(poll.id, lm.polls)
      // outGW.send(new PollStartedMessage(props.meetingProp.intId, props.recordProp.record, userId, pollId, simplePoll))
    }

    lm.polls.currentPoll // TODO had to add this line to comply with Option[Poll]
  }

  //  def getRunningPollThatStartsWith(pollId: String, polls: Polls): Option[PollVO] = {
  //    for {
  //      poll <- polls.values find { poll => poll.id.startsWith(pollId) && poll.isRunning() }
  //    } yield poll.toPollVO()
  //
  //  }
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
  //
  //  def getPolls(model: PollModel): Array[PollVO] = {
  //    val poll = new ArrayBuffer[PollVO]
  //    model.polls.values.foreach(p => {
  //      poll += p.toPollVO
  //    })
  //
  //    poll.toArray
  //  }
  //
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
  def startPoll(pollId: String, polls: Polls): Poll = {
    polls.get(pollId) foreach {
      p =>
        p.start()
        polls.currentPoll = Some(p)
    }
    polls.currentPoll.get
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
  //  def stopPoll(pollId: String, model: PollModel) {
  //    model.polls.get(pollId) foreach (p => p.stop())
  //  }
  //
  //  def hasPoll(pollId: String, model: PollModel): Boolean = {
  //    model.polls.get(pollId) != None
  //  }
  //
  def getSimplePoll(pollId: String, polls: Polls): Option[SimplePollOutVO] = {
    var pvo: Option[SimplePollOutVO] = None
    polls.get(pollId) foreach (p => pvo = Some(p.toSimplePollOutVO()))
    pvo
  }
  //
  //  def getSimplePollResult(pollId: String, model: PollModel): Option[SimplePollResultOutVO] = {
  //    var pvo: Option[SimplePollResultOutVO] = None
  //    model.polls.get(pollId) foreach (p => pvo = Some(p.toSimplePollResultOutVO()))
  //    pvo
  //  }
  //
  //  def getPoll(pollId: String, model: PollModel): Option[PollVO] = {
  //    var pvo: Option[PollVO] = None
  //    model.polls.get(pollId) foreach (p => pvo = Some(p.toPollVO()))
  //    pvo
  //  }
  //
  //  def hidePollResult(pollId: String, model: PollModel) {
  //    model.polls.get(pollId) foreach {
  //      p =>
  //        p.hideResult()
  //        model.currentPoll = None
  //    }
  //  }
  //
  //  def showPollResult(pollId: String, model: PollModel) {
  //    model.polls.get(pollId) foreach {
  //      p =>
  //        p.showResult
  //        model.currentPoll = Some(p.toPollVO())
  //    }
  //  }
  //
  //  def respondToQuestion(pollId: String, questionID: Int, responseID: Int, responder: Responder, model: PollModel) {
  //    model.polls.get(pollId) match {
  //      case Some(p) => {
  //        p.respondToQuestion(questionID, responseID, responder)
  //      }
  //      case None =>
  //    }
  //  }

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
      var i = 0
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
    println("**** Creating quesion")

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

case class AnswerVO(val id: Int, val key: String, val text: Option[String], val responders: Option[Array[Responder]])
case class QuestionVO(val id: Int, val questionType: String, val multiResponse: Boolean, val questionText: Option[String], val answers: Option[Array[AnswerVO]])
case class PollVO(val id: String, val questions: Array[QuestionVO], val title: Option[String], val started: Boolean, val stopped: Boolean, val showResult: Boolean)

case class Responder(val userId: String, name: String)

case class ResponseOutVO(id: String, text: String, responders: Array[Responder] = Array[Responder]())
case class QuestionOutVO(id: String, multiResponse: Boolean, question: String, responses: Array[ResponseOutVO])

case class SimpleAnswerOutVO(id: Int, key: String)
case class SimplePollOutVO(id: String, answers: Array[SimpleAnswerOutVO])

case class SimpleVoteOutVO(id: Int, key: String, numVotes: Int)
case class SimplePollResultOutVO(id: String, answers: Array[SimpleVoteOutVO], numRespondents: Int, numResponders: Int)

class Poll(val id: String, val questions: Array[Question], val numRespondents: Int, val title: Option[String]) {
  private var _started: Boolean = false
  private var _stopped: Boolean = false
  private var _showResult: Boolean = false
  private var _numResponders: Int = 0

  def showingResult() { _showResult = true }
  def hideResult() { _showResult = false }
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
    responders.length;
  }

  def getResponders(): Array[Responder] = {
    var r = new Array[Responder](responders.length)
    responders.copyToArray(r)
    return r
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
  //  private var polls: collection.immutable.HashMap[String, PollVO] = new collection.immutable.HashMap[String, PollVO]
  private var currentPoll: Option[Poll] = None

  private def save(poll: Poll): Poll = {
    polls += poll.id -> poll
    poll
  }

  private def remove(id: String): Option[Poll] = {
    val poll = polls.get(id)
    poll foreach (p => polls -= id)
    poll
  }

  private def get(id: String): Option[Poll] = {
    polls.get(id)
  }

  //  private def setCurrentPoll(poll: PollVO) = {
  //    currentPoll = poll
  //  }

}
