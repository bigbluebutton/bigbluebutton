package org.bigbluebutton.common2.msgs

import org.bigbluebutton.common2.domain.{PollVO, SimplePollOutVO, SimplePollResultOutVO}


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
case class PollStartedEvtMsgBody(userId: String, pollId: String, poll: SimplePollOutVO)

object PollStoppedEvtMsg { val NAME = "PollStoppedEvtMsg" }
case class PollStoppedEvtMsg(header: BbbClientMsgHeader, body: PollStoppedEvtMsgBody) extends BbbCoreMsg
case class PollStoppedEvtMsgBody(userId: String, pollId: String)

object PollUpdatedEvtMsg { val NAME = "PollUpdatedEvtMsg" }
case class PollUpdatedEvtMsg(header: BbbClientMsgHeader, body: PollUpdatedEvtMsgBody) extends BbbCoreMsg
case class PollUpdatedEvtMsgBody(pollId: String, poll: SimplePollResultOutVO)

object UserRespondedToPollRecordMsg { val NAME = "UserRespondedToPollRecordMsg" }
case class UserRespondedToPollRecordMsg(header: BbbClientMsgHeader, body: UserRespondedToPollRecordMsgBody) extends BbbCoreMsg
case class UserRespondedToPollRecordMsgBody(pollId: String, answerId: Int)

object RespondToPollReqMsg { val NAME = "RespondToPollReqMsg" }
case class RespondToPollReqMsg(header: BbbClientMsgHeader, body: RespondToPollReqMsgBody) extends StandardMsg
case class RespondToPollReqMsgBody(requesterId: String, pollId: String, questionId: Int, answerId: Int)

object UserRespondedToPollRespMsg { val NAME = "UserRespondedToPollRespMsg" }
case class UserRespondedToPollRespMsg(header: BbbClientMsgHeader, body: UserRespondedToPollRespMsgBody) extends BbbCoreMsg
case class UserRespondedToPollRespMsgBody(pollId: String, userId: String, answerId: Int)

object ShowPollResultReqMsg { val NAME = "ShowPollResultReqMsg" }
case class ShowPollResultReqMsg(header: BbbClientMsgHeader, body: ShowPollResultReqMsgBody) extends StandardMsg
case class ShowPollResultReqMsgBody(requesterId: String, pollId: String)

object StartCustomPollReqMsg { val NAME = "StartCustomPollReqMsg" }
case class StartCustomPollReqMsg(header: BbbClientMsgHeader, body: StartCustomPollReqMsgBody) extends StandardMsg
case class StartCustomPollReqMsgBody(requesterId: String, pollId: String, pollType: String, answers: Seq[String])

object StartPollReqMsg { val NAME = "StartPollReqMsg" }
case class StartPollReqMsg(header: BbbClientMsgHeader, body: StartPollReqMsgBody) extends StandardMsg
case class StartPollReqMsgBody(requesterId: String, pollId: String, pollType: String)

object StopPollReqMsg { val NAME = "StopPollReqMsg" }
case class StopPollReqMsg(header: BbbClientMsgHeader, body: StopPollReqMsgBody) extends StandardMsg
case class StopPollReqMsgBody(requesterId: String)