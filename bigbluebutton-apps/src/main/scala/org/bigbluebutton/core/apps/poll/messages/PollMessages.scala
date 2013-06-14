package org.bigbluebutton.core.apps.poll.messages


import org.bigbluebutton.core.apps.poll.QuestionType._
import org.bigbluebutton.core.api.InMessage

// Poll Messages
case class CreatePoll(meetingID:String, poll: PollVO) extends InMessage
case class StopPoll(meetingID:String, id: String) extends InMessage
case class StartPoll(meetingID:String, id: String) extends InMessage
case class AddQuestion(meetingID:String, pollID: String, question: QuestionVO)
case class DeleteQuestion(meetingID:String, pollID: String, questionID: Int)
case class AddResponse(meetingID:String, pollID: String, questionID: Int, responseVO: ResponseVO)
case class DeleteResponse(meetingID:String, pollID: String, questionID: Int, responseID: Int)

case class ResponseVO(meetingID:String, id: Int, text: String)
case class QuestionVO(meetingID:String, id: Int, questionType: QuestionType, question: String, responses: Array[ResponseVO])
case class PollVO(meetingID:String, id: String, title: String, questions: Array[QuestionVO])