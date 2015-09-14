package org.bigbluebutton.core.apps

import scala.collection.mutable.HashMap
import scala.collection.mutable.ArrayBuffer

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
      var i = 0
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