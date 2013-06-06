package org.bigbluebutton.core.apps.poll.messages

import org.bigbluebutton.core.messages.Message
import org.bigbluebutton.core.apps.poll.QuestionType._

// Poll Messages
case class CreatePoll(poll: PollVO) extends Message
case class StopPoll(id: String) extends Message
case class StartPoll(id: String) extends Message
case class AddQuestion(pollID: String, question: QuestionVO)
case class DeleteQuestion(pollID: String, questionID: Int)
case class AddResponse(pollID: String, questionID: Int, responseVO: ResponseVO)
case class DeleteResponse(pollID: String, questionID: Int, responseID: Int)

case class ResponseVO(id: Int, text: String)
case class QuestionVO(id: Int, questionType: QuestionType, question: String, responses: Array[ResponseVO])
case class PollVO(id: String, title: String, questions: Array[QuestionVO])