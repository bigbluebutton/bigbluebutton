package org.bigbluebutton.core.apps.poll.messages


import org.bigbluebutton.core.apps.poll.QuestionType._
import org.bigbluebutton.core.api.InMessage
import org.bigbluebutton.core.api.IOutMessage

// Poll Messages
case class CreatePoll(meetingID:String, poll: PollVO, requesterID: String) extends InMessage
case class UpdatePoll(meetingID: String, poll: PollVO) extends InMessage
case class GetPolls(meetingID: String, requesterID: String) extends InMessage
case class DestroyPoll(meetingID: String, pollID: String) extends InMessage
case class RemovePoll(meetingID: String, pollID: String) extends InMessage
case class SharePoll(meetingID: String, pollID: String) extends InMessage
case class StopPoll(meetingID:String, pollID: String) extends InMessage
case class StartPoll(meetingID:String, pollID: String) extends InMessage
case class ClearPoll(meetingID: String, pollID: String, requesterID: String, force: Boolean=false) extends InMessage

case class ResponseVO(meetingID:String, id: String, order: Int, text: String)
case class QuestionVO(meetingID:String, id: String, order: Int, questionType: QuestionType, question: String, responses: Array[ResponseVO])
case class PollVO(meetingID:String, id: String, title: String, questions: Array[QuestionVO], preCreated: Boolean=false)


// Out Messages
case class GetPollsReplyOutMsg(meetingID: String, recorded: String, requestedID: String, polls: Array[PollVO]) extends IOutMessage
case class ClearPollFailed(meetingID: String, pollID: String, requesterID: String, reason: String) extends IOutMessage
case class PollClearedOutMsg(meetingID: String, recorded: Boolean, pollID: String) extends IOutMessage
case class PollStartedOutMsg(meetingID: String, recorded: Boolean, pollID: String) extends IOutMessage
case class PollStoppedOutMsg(meetingID: String, recorded: Boolean, pollID: String) extends IOutMessage
case class PollRemovedOutMsg(meetingID: String, recorded: Boolean, pollID: String) extends IOutMessage

