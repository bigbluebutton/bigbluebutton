package org.bigbluebutton.common2.msgs

import org.bigbluebutton.common2.domain.{ PollVO, SimplePollOutVO, SimplePollResultOutVO }

object GetCurrentPollReqMsg { val NAME = "GetCurrentPollReqMsg" }
case class GetCurrentPollReqMsg(header: BbbClientMsgHeader, body: GetCurrentPollReqMsgBody) extends StandardMsg
case class GetCurrentPollReqMsgBody(requesterId: String)

object GetCurrentPollRespMsg { val NAME = "GetCurrentPollRespMsg" }
case class GetCurrentPollRespMsg(header: BbbClientMsgHeader, body: GetCurrentPollRespMsgBody) extends BbbCoreMsg
case class GetCurrentPollRespMsgBody(userId: String, hasPoll: Boolean, poll: Option[PollVO])

object PollShowResultEvtMsg { val NAME = "PollShowResultEvtMsg" }
case class PollShowResultEvtMsg(header: BbbClientMsgHeader, body: PollShowResultEvtMsgBody) extends BbbCoreMsg
case class PollShowResultEvtMsgBody(userId: String, pollId: String, poll: SimplePollResultOutVO)

object PollStartedEvtMsg { val NAME = "PollStartedEvtMsg" }
case class PollStartedEvtMsg(header: BbbClientMsgHeader, body: PollStartedEvtMsgBody) extends BbbCoreMsg
case class PollStartedEvtMsgBody(userId: String, pollId: String, pollType: String, secretPoll: Boolean, question: String, poll: SimplePollOutVO)

object PollStoppedEvtMsg { val NAME = "PollStoppedEvtMsg" }
case class PollStoppedEvtMsg(header: BbbClientMsgHeader, body: PollStoppedEvtMsgBody) extends BbbCoreMsg
case class PollStoppedEvtMsgBody(userId: String, pollId: String)

object PollUpdatedEvtMsg { val NAME = "PollUpdatedEvtMsg" }
case class PollUpdatedEvtMsg(header: BbbClientMsgHeader, body: PollUpdatedEvtMsgBody) extends BbbCoreMsg
case class PollUpdatedEvtMsgBody(pollId: String, poll: SimplePollResultOutVO)

object UserRespondedToPollRecordMsg { val NAME = "UserRespondedToPollRecordMsg" }
case class UserRespondedToPollRecordMsg(header: BbbClientMsgHeader, body: UserRespondedToPollRecordMsgBody) extends BbbCoreMsg
case class UserRespondedToPollRecordMsgBody(pollId: String, answerId: Int, answer: String, isSecret: Boolean)

object RespondToPollReqMsg { val NAME = "RespondToPollReqMsg" }
case class RespondToPollReqMsg(header: BbbClientMsgHeader, body: RespondToPollReqMsgBody) extends StandardMsg
case class RespondToPollReqMsgBody(requesterId: String, pollId: String, questionId: Int, answerIds: Seq[Int])

object RespondToTypedPollReqMsg { val NAME = "RespondToTypedPollReqMsg" }
case class RespondToTypedPollReqMsg(header: BbbClientMsgHeader, body: RespondToTypedPollReqMsgBody) extends StandardMsg
case class RespondToTypedPollReqMsgBody(requesterId: String, pollId: String, questionId: Int, answer: String)

object UserRespondedToPollRespMsg { val NAME = "UserRespondedToPollRespMsg" }
case class UserRespondedToPollRespMsg(header: BbbClientMsgHeader, body: UserRespondedToPollRespMsgBody) extends BbbCoreMsg
case class UserRespondedToPollRespMsgBody(pollId: String, userId: String, answerIds: Seq[Int])

object UserRespondedToTypedPollRespMsg { val NAME = "UserRespondedToTypedPollRespMsg" }
case class UserRespondedToTypedPollRespMsg(header: BbbClientMsgHeader, body: UserRespondedToTypedPollRespMsgBody) extends BbbCoreMsg
case class UserRespondedToTypedPollRespMsgBody(pollId: String, userId: String, answer: String)

object ShowPollResultReqMsg { val NAME = "ShowPollResultReqMsg" }
case class ShowPollResultReqMsg(header: BbbClientMsgHeader, body: ShowPollResultReqMsgBody) extends StandardMsg
case class ShowPollResultReqMsgBody(requesterId: String, pollId: String)

object StartCustomPollReqMsg { val NAME = "StartCustomPollReqMsg" }
case class StartCustomPollReqMsg(header: BbbClientMsgHeader, body: StartCustomPollReqMsgBody) extends StandardMsg
case class StartCustomPollReqMsgBody(requesterId: String, pollId: String, pollType: String, secretPoll: Boolean, isMultipleResponse: Boolean, answers: Seq[String], question: String)

object StartPollReqMsg { val NAME = "StartPollReqMsg" }
case class StartPollReqMsg(header: BbbClientMsgHeader, body: StartPollReqMsgBody) extends StandardMsg
case class StartPollReqMsgBody(requesterId: String, pollId: String, pollType: String, secretPoll: Boolean, question: String, isMultipleResponse: Boolean)

object StopPollReqMsg { val NAME = "StopPollReqMsg" }
case class StopPollReqMsg(header: BbbClientMsgHeader, body: StopPollReqMsgBody) extends StandardMsg
case class StopPollReqMsgBody(requesterId: String)
