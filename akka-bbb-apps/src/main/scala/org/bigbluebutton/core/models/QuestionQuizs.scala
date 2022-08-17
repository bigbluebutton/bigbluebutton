package org.bigbluebutton.core.models

import org.bigbluebutton.common2.domain._
import org.bigbluebutton.common2.msgs.AnnotationVO
import org.bigbluebutton.core.domain.MeetingState2x

import scala.collection.mutable.ArrayBuffer
import scala.collection.mutable.HashMap
import org.bigbluebutton.core.running.LiveMeeting

object QuestionQuizs {

  def handleStartQuestionQuizReqMsg(state: MeetingState2x, userId: String, questionQuizId: String, questionQuizType: String, secretQuestionQuiz: Boolean, questionText: String,
                                    multiResponse: Boolean, lm: LiveMeeting): Option[SimpleQuestionQuizOutVO] = {

    def createQuestionQuiz(stampedQuestionQuizId: String): Option[QuestionQuiz] = {
      val numRespondents: Int = Users2x.numUsers(lm.users2x) - 1 // subtract the presenter

      for {
        questionQuiz <- QuestionQuizFactory.createQuestionQuiz(stampedQuestionQuizId, questionQuizType, multiResponse, numRespondents, None, Some(questionText), secretQuestionQuiz)
      } yield {
        lm.questionQuizs.save(questionQuiz)
        questionQuiz
      }
    }
    val questionQuizWithPresentation = for {
      pod <- state.presentationPodManager.getDefaultPod()
      pres <- pod.getCurrentPresentation()
      page <- PresentationInPod.getCurrentPage(pres)
      pageId: String = if (questionQuizId.contains("deskshare")) "deskshare" else page.id
      stampedQuestionQuizId: String = pageId + "/" + System.currentTimeMillis()

      questionQuiz <- createQuestionQuiz(stampedQuestionQuizId)
      simpleQuestionQuiz <- getSimpleQuestionQuiz(questionQuiz.id, lm.questionQuizs)
    } yield {
      startQuestionQuiz(simpleQuestionQuiz.id, lm.questionQuizs)
      simpleQuestionQuiz
    }

    questionQuizWithPresentation match {
      case None => {
        val stampedQuestionQuizId: String = "public" + "/" + System.currentTimeMillis()
        for {
          questionQuiz <- createQuestionQuiz(stampedQuestionQuizId)
          simpleQuestionQuiz <- getSimpleQuestionQuiz(questionQuiz.id, lm.questionQuizs)
        } yield {
          startQuestionQuiz(simpleQuestionQuiz.id, lm.questionQuizs)
          simpleQuestionQuiz
        }
      }
      case default => default
    }
  }

  def handleStopQuestionQuizReqMsg(state: MeetingState2x, userId: String, lm: LiveMeeting): Option[String] = {
    var stoppedQuestionQuiz = for {
      pod <- state.presentationPodManager.getDefaultPod()
      pres <- pod.getCurrentPresentation()
      page <- PresentationInPod.getCurrentPage(pres)
      curQuestionQuiz <- getRunningQuestionQuizThatStartsWith(page.id, lm.questionQuizs)
    } yield {
      stopQuestionQuiz(curQuestionQuiz.id, lm.questionQuizs)
      curQuestionQuiz.id
    }

    stoppedQuestionQuiz match {
      case None => {
        for {
          // Assuming there's only one running questionQuiz at a time, fallback to the
          // current running questionQuiz without indexing by a presentation page.
          curQuestionQuiz <- getRunningQuestionQuiz(lm.questionQuizs)
        } yield {
          stopQuestionQuiz(curQuestionQuiz.id, lm.questionQuizs)
          curQuestionQuiz.id
        }
      }
      case default => default
    }
  }

  def handleShowQuestionQuizResultReqMsg(state: MeetingState2x, requesterId: String, questionQuizId: String, lm: LiveMeeting): Option[(SimpleQuestionQuizResultOutVO, AnnotationVO)] = {
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

    def send(questionQuiz: SimpleQuestionQuizResultOutVO, shape: scala.collection.immutable.Map[String, Object]): Option[AnnotationVO] = {
      for {
        pod <- state.presentationPodManager.getDefaultPod()
        pres <- pod.getCurrentPresentation()
        page <- PresentationInPod.getCurrentPage(pres)
      } yield {
        val pageId = if (questionQuiz.id.contains("deskshare")) "deskshare" else page.id
        val updatedShape = shape + ("whiteboardId" -> pageId) + ("isQuestionQuiz" -> "true")
        val annotation = new AnnotationVO(questionQuiz.id, updatedShape, pageId, requesterId)
        annotation
      }
    }

    for {
      result <- getSimpleQuestionQuizResult(questionQuizId, lm.questionQuizs)
      shape = questionQuizResultToWhiteboardShape(result)
      annot <- send(result, shape)
    } yield {
      showQuestionQuizResult(questionQuizId, lm.questionQuizs)
      (result, annot)
    }
  }

  def handleGetCurrentQuestionQuizReqMsg(state: MeetingState2x, requesterId: String, lm: LiveMeeting): Option[QuestionQuizVO] = {
    val questionQuiz = for {
      pod <- state.presentationPodManager.getDefaultPod()
      pres <- pod.getCurrentPresentation()
      page <- PresentationInPod.getCurrentPage(pres)
      curQuestionQuiz <- getRunningQuestionQuizThatStartsWith(page.id, lm.questionQuizs)
    } yield curQuestionQuiz

    questionQuiz match {
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

  def handleRespondToQuestionQuizReqMsg(requesterId: String, questionQuizId: String, questionId: Int, answerIds: Seq[Int],
                                        lm: LiveMeeting): Option[(String, SimpleQuestionQuizResultOutVO)] = {

    for {
      questionQuiz <- getSimpleQuestionQuizResult(questionQuizId, lm.questionQuizs)
      pvo <- handleRespondToQuestionQuiz(questionQuiz, requesterId, questionQuizId, questionId, answerIds, lm)
    } yield {
      (questionQuizId, pvo)
    }

  }

  def handleRespondToTypedQuestionQuizReqMsg(requesterId: String, questionQuizId: String, questionId: Int, answer: String,
                                             lm: LiveMeeting): Option[(String, SimpleQuestionQuizResultOutVO)] = {
    for {
      questionQuiz <- getSimpleQuestionQuizResult(questionQuizId, lm.questionQuizs)
      pvo <- handleRespondToTypedQuestionQuiz(questionQuiz, requesterId, questionQuizId, questionId, answer, lm)
    } yield {
      (questionQuizId, pvo)
    }
  }

  def handleStartCustomQuestionQuizReqMsg(state: MeetingState2x, requesterId: String, questionQuizId: String, questionQuizType: String, secretQuestionQuiz: Boolean,
                                          multiResponse: Boolean, answers: Seq[String], questionText: String, lm: LiveMeeting): Option[SimpleQuestionQuizOutVO] = {

    def createQuestionQuiz(stampedQuestionQuizId: String): Option[QuestionQuiz] = {
      val numRespondents: Int = Users2x.numUsers(lm.users2x) - 1 // subtract the presenter
      for {
        questionQuiz <- QuestionQuizFactory.createQuestionQuiz(stampedQuestionQuizId, questionQuizType, multiResponse, numRespondents, Some(answers), Some(questionText), secretQuestionQuiz)
      } yield {
        lm.questionQuizs.save(questionQuiz)
        questionQuiz
      }
    }
    val questionQuizWithPresentation = for {
      pod <- state.presentationPodManager.getDefaultPod()
      pres <- pod.getCurrentPresentation()
      page <- PresentationInPod.getCurrentPage(pres)
      pageId: String = if (questionQuizId.contains("deskshare")) "deskshare" else page.id
      stampedQuestionQuizId: String = pageId + "/" + System.currentTimeMillis()

      questionQuiz <- createQuestionQuiz(stampedQuestionQuizId)
      simpleQuestionQuiz <- getSimpleQuestionQuiz(questionQuiz.id, lm.questionQuizs)
    } yield {
      startQuestionQuiz(simpleQuestionQuiz.id, lm.questionQuizs)
      simpleQuestionQuiz
    }

    questionQuizWithPresentation match {
      case None => {
        val stampedQuestionQuizId: String = "public" + "/" + System.currentTimeMillis()
        for {
          questionQuiz <- createQuestionQuiz(stampedQuestionQuizId)
          simpleQuestionQuiz <- getSimpleQuestionQuiz(questionQuiz.id, lm.questionQuizs)
        } yield {
          startQuestionQuiz(simpleQuestionQuiz.id, lm.questionQuizs)
          simpleQuestionQuiz
        }
      }
      case default => default
    }

  }

  //
  // Helper methods:
  //
  private def handleRespondToQuestionQuiz(questionQuiz: SimpleQuestionQuizResultOutVO, requesterId: String, questionQuizId: String, questionId: Int,
                                          answerIds: Seq[Int], lm: LiveMeeting): Option[SimpleQuestionQuizResultOutVO] = {
    /*
   * Hardcode to zero as we are assuming the questionQuiz has only one question.
   * Our data model supports multiple question questionQuizs but for this
   * release, we only have a simple questionQuiz which has one question per questionQuiz.
   * (ralam june 23, 2015)
   */
    val questionId = 0

    def storeQuestionQuizResult(responder: Responder): Option[SimpleQuestionQuizResultOutVO] = {
      respondToQuestion(questionQuiz.id, questionId, answerIds, responder, lm.questionQuizs)
      for {
        updatedQuestionQuiz <- getSimpleQuestionQuizResult(questionQuiz.id, lm.questionQuizs)
      } yield updatedQuestionQuiz

    }

    for {
      user <- Users2x.findWithIntId(lm.users2x, requesterId)
      responder = new Responder(user.intId, user.name)
      updatedQuestionQuiz <- storeQuestionQuizResult(responder)
    } yield {
      updatedQuestionQuiz
    }
  }

  private def handleRespondToTypedQuestionQuiz(questionQuiz: SimpleQuestionQuizResultOutVO, requesterId: String, questionQuizId: String, questionId: Int,
                                               answer: String, lm: LiveMeeting): Option[SimpleQuestionQuizResultOutVO] = {

    addQuestionResponse(questionQuiz.id, questionId, answer, lm.questionQuizs)
    for {
      updatedQuestionQuiz <- getSimpleQuestionQuizResult(questionQuiz.id, lm.questionQuizs)
    } yield {
      updatedQuestionQuiz
    }
  }

  private def questionQuizResultToWhiteboardShape(result: SimpleQuestionQuizResultOutVO): scala.collection.immutable.Map[String, Object] = {
    val shape = new scala.collection.mutable.HashMap[String, Object]()
    shape += "numRespondents" -> new Integer(result.numRespondents)
    shape += "numResponders" -> new Integer(result.numResponders)
    shape += "questionType" -> result.questionType
    shape += "questionText" -> result.questionText
    shape += "id" -> result.id
    shape += "answers" -> result.answers
    shape.toMap
  }

  def getRunningQuestionQuiz(questionQuizs: QuestionQuizs): Option[QuestionQuizVO] = {
    for {
      questionQuiz <- questionQuizs.questionQuizs.values find { questionQuiz => questionQuiz.isRunning() }
    } yield questionQuiz.toQuestionQuizVO()
  }

  def getRunningQuestionQuizThatStartsWith(questionQuizId: String, questionQuizs: QuestionQuizs): Option[QuestionQuizVO] = {
    for {
      questionQuiz <- questionQuizs.questionQuizs.values find { questionQuiz => questionQuiz.id.startsWith(questionQuizId) && questionQuiz.isRunning() }
    } yield questionQuiz.toQuestionQuizVO()

  }
  //
  //  def numQuestionQuizs(questionQuizs: QuestionQuizs): Int = {
  //    questionQuizs.size
  //  }
  //
  //  def addQuestionQuiz(questionQuiz: QuestionQuiz, model: QuestionQuizModel) {
  //    model.questionQuizs += questionQuiz.id -> questionQuiz
  //  }
  //
  //  def hasCurrentQuestionQuiz(model: QuestionQuizModel): Boolean = {
  //    model.currentQuestionQuiz != None
  //  }
  //
  //  def getCurrentQuestionQuiz(model: QuestionQuizModel): Option[QuestionQuizVO] = {
  //    model.currentQuestionQuiz
  //  }

  def getQuestionQuizs(questionQuizs: QuestionQuizs): Array[QuestionQuizVO] = {
    val questionQuiz = new ArrayBuffer[QuestionQuizVO]
    questionQuizs.questionQuizs.values.foreach(p => {
      questionQuiz += p.toQuestionQuizVO()
    })

    questionQuiz.toArray
  }

  //  def clearQuestionQuiz(questionQuizID: String, model: QuestionQuizModel): Boolean = {
  //    var success = false
  //    model.questionQuizs.get(questionQuizID) match {
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
  def startQuestionQuiz(questionQuizId: String, questionQuizs: QuestionQuizs) {
    questionQuizs.get(questionQuizId) foreach {
      p =>
        p.start()
        questionQuizs.currentQuestionQuiz = Some(p)
    }
  }
  //
  //  def removeQuestionQuiz(questionQuizID: String, model: QuestionQuizModel): Boolean = {
  //    var success = false
  //    model.questionQuizs.get(questionQuizID) match {
  //      case Some(p) => {
  //        model.questionQuizs -= p.id
  //        success = true
  //      }
  //      case None => success = false
  //    }
  //
  //    success
  //  }
  //
  def stopQuestionQuiz(questionQuizId: String, questionQuizs: QuestionQuizs) {
    questionQuizs.get(questionQuizId) foreach (p => p.stop())
  }

  //  def hasQuestionQuiz(questionQuizId: String, model: QuestionQuizModel): Boolean = {
  //    model.questionQuizs.get(questionQuizId) != None
  //  }
  //
  def getSimpleQuestionQuiz(questionQuizId: String, questionQuizs: QuestionQuizs): Option[SimpleQuestionQuizOutVO] = {
    var pvo: Option[SimpleQuestionQuizOutVO] = None
    questionQuizs.get(questionQuizId) foreach (p => pvo = Some(p.toSimpleQuestionQuizOutVO()))
    pvo
  }

  def getSimpleQuestionQuizResult(questionQuizId: String, questionQuizs: QuestionQuizs): Option[SimpleQuestionQuizResultOutVO] = {
    var pvo: Option[SimpleQuestionQuizResultOutVO] = None
    questionQuizs.get(questionQuizId) foreach (p => pvo = Some(p.toSimpleQuestionQuizResultOutVO()))
    pvo
  }

  def getQuestionQuiz(questionQuizId: String, questionQuizs: QuestionQuizs): Option[QuestionQuizVO] = {
    var pvo: Option[QuestionQuizVO] = None
    questionQuizs.get(questionQuizId) foreach (p => pvo = Some(p.toQuestionQuizVO()))
    pvo
  }

  def showQuestionQuizResult(questionQuizId: String, questionQuizs: QuestionQuizs) {
    questionQuizs.get(questionQuizId) foreach {
      p =>
        p.showResult
        questionQuizs.currentQuestionQuiz = Some(p)
    }
  }

  def respondToQuestion(questionQuizId: String, questionID: Int, responseIDs: Seq[Int], responder: Responder, questionQuizs: QuestionQuizs) {
    questionQuizs.questionQuizs.get(questionQuizId) match {
      case Some(p) => {
        if (!p.getResponders().contains(responder)) {
          p.addResponder(responder)
          p.respondToQuestion(questionID, responseIDs, responder)
        }
      }
      case None =>
    }
  }

  def addQuestionResponse(questionQuizId: String, questionID: Int, answer: String, questionQuizs: QuestionQuizs) {
    questionQuizs.questionQuizs.get(questionQuizId) match {
      case Some(p) => {
        p.addQuestionResponse(questionID, answer)
      }
      case None =>
    }
  }
}

object QuestionQuizType {
  val YesNoQuestionQuizType = "YN"
  val YesNoAbstentionQuestionQuizType = "YNA"
  val TrueFalseQuestionQuizType = "TF"
  val CustomQuestionQuizType = "CUSTOM"
  val LetterQuestionQuizType = "A-"
  val NumberQuestionQuizType = "1-"
  val ResponseQuestionQuizType = "R-"
}

object QuestionQuizFactory {

  val LetterArray = Array("A", "B", "C", "D", "E", "F")
  val NumberArray = Array("1", "2", "3", "4", "5", "6")

  private def processYesNoQuestionQuizType(qType: String, multiResponse: Boolean, text: Option[String]): QuizQuestion = {
    val answers = new ArrayBuffer[QuizAnswer];

    answers += new QuizAnswer(0, "Yes", Some("Yes"))
    answers += new QuizAnswer(1, "No", Some("No"))

    new QuizQuestion(0, QuestionQuizType.YesNoQuestionQuizType, multiResponse, text, answers)
  }

  private def processYesNoAbstentionQuestionQuizType(qType: String, multiResponse: Boolean, text: Option[String]): QuizQuestion = {
    val answers = new ArrayBuffer[QuizAnswer]

    answers += new QuizAnswer(0, "Yes", Some("Yes"))
    answers += new QuizAnswer(1, "No", Some("No"))
    answers += new QuizAnswer(2, "Abstention", Some("Abstention"))

    new QuizQuestion(0, QuestionQuizType.YesNoAbstentionQuestionQuizType, multiResponse, text, answers)
  }

  private def processTrueFalseQuestionQuizType(qType: String, multiResponse: Boolean, text: Option[String]): QuizQuestion = {
    val answers = new ArrayBuffer[QuizAnswer];

    answers += new QuizAnswer(0, "True", Some("True"))
    answers += new QuizAnswer(1, "False", Some("False"))

    new QuizQuestion(0, QuestionQuizType.TrueFalseQuestionQuizType, multiResponse, text, answers)
  }

  private def processLetterQuestionQuizType(qType: String, multiResponse: Boolean, text: Option[String]): Option[QuizQuestion] = {
    val q = qType.split('-')
    val numQs = q(1).toInt

    var questionOption: Option[QuizQuestion] = None

    if (numQs > 0 && numQs <= 6) {
      val answers = new ArrayBuffer[QuizAnswer];
      for (i <- 0 until numQs) {
        answers += new QuizAnswer(i, LetterArray(i), Some(LetterArray(i)))
        val question = new QuizQuestion(0, QuestionQuizType.LetterQuestionQuizType, multiResponse, text, answers)
        questionOption = Some(question)
      }
    }

    questionOption
  }

  private def processNumberQuestionQuizType(qType: String, multiResponse: Boolean, text: Option[String]): Option[QuizQuestion] = {
    val q = qType.split('-')
    val numQs = q(1).toInt

    var questionOption: Option[QuizQuestion] = None

    if (numQs > 0 && numQs <= 6) {
      val answers = new ArrayBuffer[QuizAnswer];
      for (i <- 0 until numQs) {
        answers += new QuizAnswer(i, NumberArray(i), Some(NumberArray(i)))
        val question = new QuizQuestion(0, QuestionQuizType.NumberQuestionQuizType, multiResponse, text, answers)
        questionOption = Some(question)
      }
    }
    questionOption
  }

  private def buildAnswers(answers: Seq[String]): ArrayBuffer[QuizAnswer] = {
    val ans = new ArrayBuffer[QuizAnswer]
    for (i <- 0 until answers.length) {
      ans += new QuizAnswer(i, answers(i), Some(answers(i)))
    }

    ans
  }

  private def processCustomQuestionQuizType(qType: String, multiResponse: Boolean, text: Option[String], answers: Option[Seq[String]]): Option[QuizQuestion] = {
    var questionOption: Option[QuizQuestion] = None

    answers.foreach { ans =>
      val someAnswers = buildAnswers(ans)
      val question = new QuizQuestion(0, QuestionQuizType.CustomQuestionQuizType, multiResponse, text, someAnswers)
      questionOption = Some(question)
    }

    questionOption
  }

  private def processResponseQuestionQuizType(qType: String, text: Option[String]): Option[QuizQuestion] = {
    var questionOption: Option[QuizQuestion] = None

    val answers = new ArrayBuffer[QuizAnswer]
    val question = new QuizQuestion(0, QuestionQuizType.ResponseQuestionQuizType, false, text, answers)
    questionOption = Some(question)

    questionOption
  }

  private def createQuestion(qType: String, multiResponse: Boolean, answers: Option[Seq[String]], text: Option[String]): Option[QuizQuestion] = {

    val qt = qType.toUpperCase()
    var questionOption: Option[QuizQuestion] = None

    if (qt.matches(QuestionQuizType.YesNoQuestionQuizType)) {
      questionOption = Some(processYesNoQuestionQuizType(qt, multiResponse, text))
    } else if (qt.matches(QuestionQuizType.YesNoAbstentionQuestionQuizType)) {
      questionOption = Some(processYesNoAbstentionQuestionQuizType(qt, multiResponse, text))
    } else if (qt.matches(QuestionQuizType.TrueFalseQuestionQuizType)) {
      questionOption = Some(processTrueFalseQuestionQuizType(qt, multiResponse, text))
    } else if (qt.matches(QuestionQuizType.CustomQuestionQuizType)) {
      questionOption = processCustomQuestionQuizType(qt, multiResponse, text, answers)
    } else if (qt.startsWith(QuestionQuizType.LetterQuestionQuizType)) {
      questionOption = processLetterQuestionQuizType(qt, multiResponse, text)
    } else if (qt.startsWith(QuestionQuizType.NumberQuestionQuizType)) {
      questionOption = processNumberQuestionQuizType(qt, multiResponse, text)
    } else if (qt.startsWith(QuestionQuizType.ResponseQuestionQuizType)) {
      questionOption = processResponseQuestionQuizType(qt, text)
    }

    questionOption
  }

  def createQuestionQuiz(id: String, questionQuizType: String, multiResponse: Boolean, numRespondents: Int, answers: Option[Seq[String]], questionText: Option[String], isSecret: Boolean): Option[QuestionQuiz] = {
    var questionQuiz: Option[QuestionQuiz] = None

    createQuestion(questionQuizType, multiResponse, answers, questionText) match {
      case Some(question) => {
        questionQuiz = Some(new QuestionQuiz(id, Array(question), numRespondents, None, isSecret))
      }
      case None => questionQuiz = None
    }

    questionQuiz
  }
}

case class QuizResponsesVO(val questionID: String, val responseIDs: Array[String])
case class QuestionQuizResponseVO(val questionQuizID: String, val responses: Array[QuizResponsesVO])
case class QuestionQuizResponderVO(responseID: String, user: Responder)

case class QuizResponseOutVO(id: String, text: String, responders: Array[Responder] = Array[Responder]())
case class QuizQuestionOutVO(id: String, multiResponse: Boolean, question: String, responses: Array[QuizResponseOutVO])

class QuestionQuiz(val id: String, val questions: Array[QuizQuestion], val numRespondents: Int, val title: Option[String], val isSecret: Boolean) {
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

  def toQuestionQuizVO(): QuestionQuizVO = {
    val qvos = new ArrayBuffer[QuestionVO]
    questions.foreach(q => {
      qvos += q.toQuestionVO
    })

    new QuestionQuizVO(id, qvos.toArray, title, _started, _stopped, _showResult, isSecret)
  }

  def toSimpleQuestionQuizOutVO(): SimpleQuestionQuizOutVO = {
    new SimpleQuestionQuizOutVO(id, questions(0).multiResponse, questions(0).toSimpleAnswerOutVO())
  }

  def toSimpleQuestionQuizResultOutVO(): SimpleQuestionQuizResultOutVO = {
    new SimpleQuestionQuizResultOutVO(id, questions(0).questionType, questions(0).text, questions(0).toSimpleVotesOutVO(), numRespondents, _numResponders)
  }
}

class QuizQuestion(val id: Int, val questionType: String, val multiResponse: Boolean, val text: Option[String], val answers: ArrayBuffer[QuizAnswer]) {
  def addAnswer(text: String) {
    answers += new QuizAnswer(answers.size, text, Some(text))
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

class QuizAnswer(val id: Int, val key: String, val text: Option[String]) {

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

class QuestionQuizs {
  private val questionQuizs = new HashMap[String, QuestionQuiz]()
  private var currentQuestionQuiz: Option[QuestionQuiz] = None

  private def save(questionQuiz: QuestionQuiz): QuestionQuiz = {
    questionQuizs += questionQuiz.id -> questionQuiz
    questionQuiz
  }

  /*
  private def remove(id: String): Option[QuestionQuiz] = {
    val questionQuiz = questionQuizs.get(id)
    questionQuiz foreach (p => questionQuizs -= id)
    questionQuiz
  }
  */

  private def get(id: String): Option[QuestionQuiz] = {
    questionQuizs.get(id)
  }

}
