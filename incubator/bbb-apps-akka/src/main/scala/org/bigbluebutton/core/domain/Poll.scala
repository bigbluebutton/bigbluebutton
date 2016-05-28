package org.bigbluebutton.core.domain

case class QuestionResponsesVO(questionID: String, responseIDs: Array[String])

case class PollResponseVO(pollID: String, responses: Array[QuestionResponsesVO])

case class ResponderVO(responseID: String, user: Responder)

case class AnswerVO(id: Int, key: String, text: Option[String], responders: Option[Array[Responder]])

case class QuestionVO(
  id: Int,
  questionType: String,
  multiResponse: Boolean,
  questionText: Option[String],
  answers: Option[Array[AnswerVO]])

case class PollVO(
  id: String,
  questions: Array[QuestionVO],
  title: Option[String],
  started: Boolean,
  stopped: Boolean,
  showResult: Boolean)

case class Responder(userId: IntUserId, name: Name)

case class ResponseOutVO(
  id: String,
  text: String,
  responders: Array[Responder] = Array[Responder]())

case class QuestionOutVO(
  id: String,
  multiResponse: Boolean,
  question: String,
  responses: Array[ResponseOutVO])

case class SimpleAnswerOutVO(id: Int, key: String)

case class SimplePollOutVO(id: String, answers: Array[SimpleAnswerOutVO])

case class SimpleVoteOutVO(id: Int, key: String, numVotes: Int)

case class SimplePollResultOutVO(
  id: String,
  answers: Array[SimpleVoteOutVO],
  numRespondents: Int,
  numResponders: Int)
