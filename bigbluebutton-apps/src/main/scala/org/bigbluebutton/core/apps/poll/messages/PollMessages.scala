package org.bigbluebutton.core.apps.poll.messages


import org.bigbluebutton.core.apps.poll.QuestionType._
import org.bigbluebutton.core.api.InMessage
import org.bigbluebutton.core.api.IOutMessage

// Poll Messages
case class CreatePoll(meetingID: String, poll: PollVO, requesterID: String) extends InMessage
case class UpdatePoll(meetingID: String, poll: PollVO) extends InMessage
case class GetPolls(meetingID: String, requesterID: String) extends InMessage
case class DestroyPoll(meetingID: String, pollID: String) extends InMessage
case class RemovePoll(meetingID: String, pollID: String) extends InMessage
case class SharePoll(meetingID: String, pollID: String) extends InMessage
case class StopPoll(meetingID:String, pollID: String) extends InMessage
case class StartPoll(meetingID:String, pollID: String) extends InMessage
case class ClearPoll(meetingID: String, pollID: String, requesterID: String, force: Boolean=false) extends InMessage
case class GetPollResult(meetingID:String, pollID: String, requesterID: String) extends InMessage

case class ResponseVO(id: String, text: String)
case class QuestionVO(id: String, multiResponse: Boolean, question: String, responses: Array[ResponseVO])
case class PollVO(id: String, title: String, questions: Array[QuestionVO])

case class R(id: String, text: String)
case class Q(id: String, questionType: String, question: String, responses: Array[R])
case class P(id: String, title: String, questions: Array[Q], preCreated: Boolean=false)

// Out Messages
case class GetPollResultReply(meetingID: String, recorded: Boolean, requesterID: String, pollVO: PollVO) extends IOutMessage
case class GetPollsReplyOutMsg(meetingID: String, recorded: Boolean, requesterID: String, polls: Array[PollVO]) extends IOutMessage
case class ClearPollFailed(meetingID: String, pollID: String, requesterID: String, reason: String) extends IOutMessage
case class PollClearedOutMsg(meetingID: String, recorded: Boolean, pollID: String) extends IOutMessage
case class PollStartedOutMsg(meetingID: String, recorded: Boolean, pollID: String) extends IOutMessage
case class PollStoppedOutMsg(meetingID: String, recorded: Boolean, pollID: String) extends IOutMessage
case class PollRemovedOutMsg(meetingID: String, recorded: Boolean, pollID: String) extends IOutMessage
case class PollUpdatedOutMsg(meetingID: String, recorded: Boolean, pollID: String, pollVO: PollVO) extends IOutMessage
case class PollCreatedOutMsg(meetingID: String, recorded: Boolean, pollID: String, pollVO: PollVO) extends IOutMessage
