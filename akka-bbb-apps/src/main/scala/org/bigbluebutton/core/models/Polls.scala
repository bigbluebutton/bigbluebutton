package org.bigbluebutton.core.models

import org.bigbluebutton.common2.domain._
import org.bigbluebutton.common2.msgs.{ AnnotationVO, BbbClientMsgHeader, BbbCommonEnvCoreMsg, BbbCoreEnvelope, MessageTypes, Routing, SendWhiteboardAnnotationsEvtMsg, SendWhiteboardAnnotationsEvtMsgBody, StartCustomPollReqMsg, StartPollReqMsg }
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.{ PollDAO, PollResponseDAO }
import org.bigbluebutton.core.domain.MeetingState2x

import scala.collection.mutable.ArrayBuffer
import scala.collection.mutable.HashMap
import org.bigbluebutton.core.running.LiveMeeting

object Polls {

  def handleStartPollReqMsg(state: MeetingState2x, userId: String, msg: StartPollReqMsg, lm: LiveMeeting): Option[SimplePollOutVO] = {
    val pollId = msg.body.pollId

    def createPoll(stampedPollId: String): Option[Poll] = {
      val numRespondents: Int = Users2x.numUsers(lm.users2x) - 1 // subtract the presenter

      for {
        poll <- PollFactory.createPoll(
          stampedPollId,
          msg.body.pollType,
          msg.body.multipleResponse,
          msg.body.quiz,
          numRespondents,
          Some(msg.body.question),
          pollOptions = None,
          msg.body.correctAnswer match {
            case ""             => None
            case answer: String => Some(answer)
          },
          msg.body.secretPoll
        )
      } yield {
        PollDAO.insert(lm.props.meetingProp.intId, userId, poll)
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

  def getPollResult(pollId: String, lm: LiveMeeting): Option[(SimplePollResultOutVO)] = {
    for {
      result <- getSimplePollResult(pollId, lm.polls)
    } yield {
      (result)
    }
  }

  def handleShowPollResultReqMsgForAnnotation(
      state:       MeetingState2x,
      requesterId: String,
      pollId:      String,
      showAnswer:  Boolean,
      lm:          LiveMeeting,
      result:      SimplePollResultOutVO,
      bus:         MessageBus
  ): Unit = {
    def send(poll: SimplePollResultOutVO, shape: scala.collection.immutable.Map[String, Object]): Option[AnnotationVO] = {
      for {
        pod <- state.presentationPodManager.getDefaultPod()
        pres <- pod.getCurrentPresentation()
        page <- PresentationInPod.getCurrentPage(pres)
      } yield {
        val pageId = if (poll.id.contains("deskshare")) "deskshare" else page.id
        val updatedShape = shape + ("whiteboardId" -> pageId)
        val annotation = new AnnotationVO(s"shape:poll-result-${poll.id}", updatedShape, pageId, requesterId)
        annotation
      }
    }

    for {
      poll <- Polls.getPoll(pollId, lm.polls)
      pod <- state.presentationPodManager.getDefaultPod()
      pres <- pod.getCurrentPresentation()
      page <- PresentationInPod.getCurrentPage(pres)
      shape = pollResultToWhiteboardShape(result, page, poll.questions(0).quiz, showAnswer)
      annot <- send(result, shape)
    } yield {
      lm.wbModel.addAnnotations(annot.wbId, lm.props.meetingProp.intId, requesterId, Array[AnnotationVO](annot), isPresenter = false, isModerator = false)
      showPollResult(pollId, lm.polls, showAnswer)
      // Send annotations with the result to recordings
      val annotationRouting = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, lm.props.meetingProp.intId, requesterId)
      val annotationEnvelope = BbbCoreEnvelope(SendWhiteboardAnnotationsEvtMsg.NAME, annotationRouting)
      val annotationHeader = BbbClientMsgHeader(SendWhiteboardAnnotationsEvtMsg.NAME, lm.props.meetingProp.intId, requesterId)

      val annotMsgBody = SendWhiteboardAnnotationsEvtMsgBody(annot.wbId, Array[AnnotationVO](annot))
      val annotationEvent = SendWhiteboardAnnotationsEvtMsg(annotationHeader, annotMsgBody)
      val annotationMsgEvent = BbbCommonEnvCoreMsg(annotationEnvelope, annotationEvent)
      bus.outGW.send(annotationMsgEvent)
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
      poll <- lm.polls.get(pollId)
      simplePoll <- getSimplePollResult(pollId, lm.polls)
      pvo <- handleRespondToPoll(simplePoll, requesterId, pollId, questionId, answerIds, lm)
    } yield {
      PollResponseDAO.insert(poll, lm.props.meetingProp.intId, requesterId, answerIds)
      (pollId, pvo)
    }

  }

  def handleRespondToTypedPollReqMsg(requesterId: String, pollId: String, questionId: Int, answer: String,
                                     lm: LiveMeeting): Option[(String, SimplePollResultOutVO)] = {
    for {
      poll <- getSimplePollResult(pollId, lm.polls)
      pvo <- handleRespondToTypedPoll(poll, requesterId, pollId, questionId, answer, lm)
    } yield {
      PollDAO.updateOptions(pvo)
      (pollId, pvo)
    }
  }

  def handleStartCustomPollReqMsg(state: MeetingState2x, requesterId: String, msg: StartCustomPollReqMsg, lm: LiveMeeting): Option[SimplePollOutVO] = {
    val pollId = msg.body.pollId

    def createPoll(stampedPollId: String): Option[Poll] = {
      val numRespondents: Int = Users2x.numUsers(lm.users2x) - 1 // subtract the presenter
      for {
        poll <- PollFactory.createPoll(
          stampedPollId,
          msg.body.pollType,
          msg.body.multipleResponse,
          msg.body.quiz,
          numRespondents,
          Some(msg.body.question),
          Some(msg.body.answers),
          msg.body.correctAnswer match {
            case ""             => None
            case answer: String => Some(answer)
          },
          msg.body.secretPoll
        )
      } yield {
        PollDAO.insert(lm.props.meetingProp.intId, requesterId, poll)
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

  private def pollResultToWhiteboardShape(
      result:     SimplePollResultOutVO,
      page:       PresentationPage,
      quiz:       Boolean,
      showAnswer: Boolean
  ): scala.collection.immutable.Map[String, Object] = {
    val maxImageWidth = 1440
    val maxImageHeight = 1080

    // Base dimensions for the poll annotation
    var pollWidth = 300
    var pollHeight = 200

    val questionText = result.questionText.getOrElse("")
    val questionLength = questionText.length

    // Adjust width and height based on question length
    val extraLines = {
      if (questionLength == 0) {
        0
      } else if (questionLength > 60) {
        // Increase width for long questions
        pollWidth = 600
        val charsPerLine = 75
        questionLength / charsPerLine
      } else {
        val charsPerLine = 30
        questionLength / charsPerLine
      }
    }
    if (extraLines > 1) {
      // Add height proportional to extra lines needed
      val additionalHeight = Math.round(extraLines * 45.0)
      pollHeight += additionalHeight.toInt
    }

    // Adjust height based on the number of answers
    val defaultAnswerCount = 3
    val extraAnswerCount = result.answers.size - defaultAnswerCount
    if (extraAnswerCount > 0) {
      val additionalHeight = Math.round(extraAnswerCount * 40.0)
      pollHeight += additionalHeight.toInt
    }

    val whiteboardRatio = Math.min(maxImageWidth / page.width, maxImageHeight / page.height);
    val scaledWidth = page.width * whiteboardRatio
    val scaledHeight = page.height * whiteboardRatio

    val x: Double = scaledWidth - pollWidth
    val y: Double = scaledHeight - pollHeight

    val shape = new scala.collection.mutable.HashMap[String, Object]()
    val props = new scala.collection.mutable.HashMap[String, Object]()
    val meta = new scala.collection.mutable.HashMap[String, Object]()

    props += "answers" -> {
      for {
        answer <- result.answers
      } yield {
        Map(
          "id" -> answer.id,
          "key" -> answer.key,
          "numVotes" -> answer.numVotes,
          "isCorrectAnswer" -> (showAnswer && answer.isCorrectAnswer)
        )
      }
    }

    props += "numRespondents" -> Integer.valueOf(result.numRespondents)
    props += "numResponders" -> Integer.valueOf(result.numResponders)
    props += "questionText" -> result.questionText.getOrElse("")
    props += "questionType" -> result.questionType
    props += "w" -> Integer.valueOf(pollWidth)
    props += "h" -> Integer.valueOf(pollHeight)
    props += "fill" -> "black"
    props += "color" -> "black"
    props += "question" -> result.questionText.getOrElse("")

    shape += "x" -> java.lang.Double.valueOf(x)
    shape += "y" -> java.lang.Double.valueOf(y)
    shape += "isLocked" -> java.lang.Boolean.valueOf(false)
    shape += "index" -> "a1"
    shape += "rotation" -> Integer.valueOf(0)
    shape += "parentId" -> s"page:${page.num}"
    shape += "typeName" -> "shape"
    shape += "opacity" -> Integer.valueOf(1)
    shape += "id" -> s"shape:poll-result-${result.id}"
    shape += "meta" -> meta.toMap
    shape += "type" -> "poll"

    shape += "props" -> props.toMap

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

  def getPolls(polls: Polls): Array[PollVO] = {
    val poll = new ArrayBuffer[PollVO]
    polls.polls.values.foreach(p => {
      poll += p.toPollVO()
    })

    poll.toArray
  }

  def startPoll(pollId: String, polls: Polls) {
    polls.get(pollId) foreach {
      p =>
        p.start()
        polls.currentPoll = Some(p)
    }
  }

  def stopPoll(pollId: String, polls: Polls) {
    polls.get(pollId) foreach (p => p.stop())
    PollDAO.updateEnded(pollId)
  }

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

  def hasUserAlreadyResponded(pollId: String, userId: String, polls: Polls): Boolean = {
    polls.polls.get(pollId) match {
      case Some(p) => {
        if (p.getResponders().exists(p => p.userId == userId)) {
          true
        } else {
          false
        }
      }
      case None => false
    }
  }

  def hasUserAlreadyAddedTypedAnswer(pollId: String, userId: String, polls: Polls): Boolean = {
    polls.polls.get(pollId) match {
      case Some(p) => {
        if (p.getTypedPollResponders().contains(userId)) {
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

  def findAnswerWithText(pollId: String, questionId: Int, answerText: String, polls: Polls): Option[Int] = {
    for {
      poll <- Polls.getPoll(pollId, polls)
      question <- poll.questions.find(q => q.id == questionId)
      answers <- question.answers
      equalAnswer <- answers.find(ans => ans.text.getOrElse("") == answerText)
    } yield {
      equalAnswer.id
    }
  }

  def showPollResult(pollId: String, polls: Polls, showAnswer: Boolean) {
    polls.get(pollId) foreach {
      p =>
        p.showResult()
        polls.currentPoll = Some(p)
        PollDAO.updatePublished(pollId, showAnswer = (showAnswer && p.questions(0).quiz))
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

  private def processYesNoPollType(qType: String, multiResponse: Boolean, quiz: Boolean, questionText: Option[String], correctAnswer: Option[String]): Question = {
    val pollOptions = new ArrayBuffer[Answer];

    pollOptions += new Answer(0, "Yes", Some("Yes"))
    pollOptions += new Answer(1, "No", Some("No"))

    new Question(0, PollType.YesNoPollType, multiResponse, quiz, questionText, pollOptions, correctAnswer)
  }

  private def processYesNoAbstentionPollType(qType: String, multiResponse: Boolean, quiz: Boolean, questionText: Option[String], correctAnswer: Option[String]): Question = {
    val pollOptions = new ArrayBuffer[Answer]

    pollOptions += new Answer(0, "Yes", Some("Yes"))
    pollOptions += new Answer(1, "No", Some("No"))
    pollOptions += new Answer(2, "Abstention", Some("Abstention"))

    new Question(0, PollType.YesNoAbstentionPollType, multiResponse, quiz, questionText, pollOptions, correctAnswer)
  }

  private def processTrueFalsePollType(qType: String, multiResponse: Boolean, quiz: Boolean, questionText: Option[String], correctAnswer: Option[String]): Question = {
    val pollOptions = new ArrayBuffer[Answer];

    pollOptions += new Answer(0, "True", Some("True"))
    pollOptions += new Answer(1, "False", Some("False"))

    new Question(0, PollType.TrueFalsePollType, multiResponse, quiz, questionText, pollOptions, correctAnswer)
  }

  private def processLetterPollType(qType: String, multiResponse: Boolean, quiz: Boolean, questionText: Option[String], correctAnswer: Option[String]): Option[Question] = {
    val q = qType.split('-')
    val numQs = q(1).toInt

    var question: Option[Question] = None

    if (numQs > 0 && numQs <= 6) {
      val answers = new ArrayBuffer[Answer];
      for (i <- 0 until numQs) {
        answers += new Answer(i, LetterArray(i), Some(LetterArray(i)))
      }
      question = Some(new Question(0, PollType.LetterPollType, multiResponse, quiz, questionText, answers, correctAnswer))
    }

    question
  }

  private def processNumberPollType(qType: String, multiResponse: Boolean, quiz: Boolean, questionText: Option[String], correctAnswer: Option[String]): Option[Question] = {
    val q = qType.split('-')
    val numQs = q(1).toInt

    var question: Option[Question] = None

    if (numQs > 0 && numQs <= 6) {
      val answers = new ArrayBuffer[Answer];
      for (i <- 0 until numQs) {
        answers += new Answer(i, NumberArray(i), Some(NumberArray(i)))
      }
      question = Some(new Question(0, PollType.NumberPollType, multiResponse, quiz, questionText, answers, correctAnswer))
    }

    question
  }

  private def buildAnswers(pollOptions: Seq[String]): ArrayBuffer[Answer] = {
    val ans = new ArrayBuffer[Answer]
    for (i <- 0 until pollOptions.length) {
      ans += new Answer(i, pollOptions(i), Some(pollOptions(i)))
    }

    ans
  }

  private def processCustomPollType(qType: String, multiResponse: Boolean, quiz: Boolean, questionText: Option[String], pollOptions: Option[Seq[String]], correctOption: Option[String]): Option[Question] = {
    var question: Option[Question] = None

    pollOptions.foreach { opt =>
      val pollOption = buildAnswers(opt)
      question = Some(new Question(0, PollType.CustomPollType, multiResponse, quiz, questionText, pollOption, correctOption))
    }

    question
  }

  private def processResponsePollType(qType: String, questionText: Option[String]): Option[Question] = {
    var questionOption: Option[Question] = None

    val answers = new ArrayBuffer[Answer]
    val question = new Question(0, PollType.ResponsePollType, false, false, questionText, answers, None)
    questionOption = Some(question)

    questionOption
  }

  private def createQuestion(
      qType:         String,
      multiResponse: Boolean,
      quiz:          Boolean,
      questionText:  Option[String],
      pollOptions:   Option[Seq[String]],
      correctOption: Option[String]
  ): Option[Question] = {

    val qt = qType.toUpperCase()
    var question: Option[Question] = None

    if (qt.matches(PollType.YesNoPollType)) {
      question = Some(processYesNoPollType(qt, multiResponse, quiz, questionText, correctOption))
    } else if (qt.matches(PollType.YesNoAbstentionPollType)) {
      question = Some(processYesNoAbstentionPollType(qt, multiResponse, quiz, questionText, correctOption))
    } else if (qt.matches(PollType.TrueFalsePollType)) {
      question = Some(processTrueFalsePollType(qt, multiResponse, quiz, questionText, correctOption))
    } else if (qt.matches(PollType.CustomPollType)) {
      question = processCustomPollType(qt, multiResponse, quiz, questionText, pollOptions, correctOption)
    } else if (qt.startsWith(PollType.LetterPollType)) {
      question = processLetterPollType(qt, multiResponse, quiz, questionText, correctOption)
    } else if (qt.startsWith(PollType.NumberPollType)) {
      question = processNumberPollType(qt, multiResponse, quiz, questionText, correctOption)
    } else if (qt.startsWith(PollType.ResponsePollType)) {
      question = processResponsePollType(qt, questionText)
    }

    question
  }

  def createPoll(
      id:             String,
      pollType:       String,
      multiResponse:  Boolean,
      quiz:           Boolean,
      numRespondents: Int,
      questionText:   Option[String],
      pollOptions:    Option[Seq[String]],
      correctOption:  Option[String],
      isSecret:       Boolean
  ): Option[Poll] = {
    var poll: Option[Poll] = None

    createQuestion(pollType, multiResponse, quiz, questionText, pollOptions, correctOption) match {
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

class Poll(
    val id:             String,
    val questions:      Array[Question],
    val numRespondents: Int,
    val title:          Option[String],
    val isSecret:       Boolean
) {
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
    new SimplePollOutVO(id, questions(0).multiResponse, questions(0).quiz, questions(0).toSimpleAnswerOutVO(), questions(0).correctAnswer)
  }

  def toSimplePollResultOutVO(): SimplePollResultOutVO = {
    new SimplePollResultOutVO(id, questions(0).questionType, questions(0).text,
      questions(0).toSimpleVotesOutVO(questions(0).correctAnswer.getOrElse("")),
      questions(0).quiz, questions(0).correctAnswer, numRespondents, _numResponders)
  }
}

class Question(
    val id:            Int,
    val questionType:  String,
    val multiResponse: Boolean,
    val quiz:          Boolean,
    val text:          Option[String],
    val answers:       ArrayBuffer[Answer],
    val correctAnswer: Option[String]
) {
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

    new QuestionVO(id, questionType, multiResponse, quiz, text, Some(rvos.toArray), correctAnswer)
  }

  def toSimpleAnswerOutVO(): Array[SimpleAnswerOutVO] = {
    val rvos = new ArrayBuffer[SimpleAnswerOutVO]
    answers.foreach(answer => {
      rvos += answer.toSimpleAnswerOutVO()
    })

    rvos.toArray
  }

  def toSimpleVotesOutVO(correctAnswer: String): Array[SimpleVoteOutVO] = {
    val rvos = new ArrayBuffer[SimpleVoteOutVO]
    answers.foreach(answer => {
      rvos += answer.toSimpleVoteOutVO(correctAnswer)
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

  def toSimpleVoteOutVO(correctAnswer: String): SimpleVoteOutVO = {
    new SimpleVoteOutVO(id, key, numResponders, (key == correctAnswer))
  }
}

class Polls {
  private val polls = new HashMap[String, Poll]()
  private var currentPoll: Option[Poll] = None

  private def save(poll: Poll): Poll = {
    polls += poll.id -> poll
    poll
  }

  private def get(id: String): Option[Poll] = {
    polls.get(id)
  }

}
