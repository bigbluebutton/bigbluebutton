package org.bigbluebutton.common2.msgs

import org.bigbluebutton.common2.domain.{PollVO, SimplePollOutVO, SimplePollResultOutVO}


object GetCurrentPollReqMsg { val NAME = "GetCurrentPollReqMsg" }
case class GetCurrentPollReqMsg(header: BbbClientMsgHeader, body: GetCurrentPollReqMsgBody) extends StandardMsg
case class GetCurrentPollReqMsgBody(requesterId: String)


object GetCurrentPollRespMsg { val NAME = "GetCurrentPollRespMsg" }
case class GetCurrentPollRespMsg(header: BbbClientMsgHeader, body: GetCurrentPollRespMsgBody) extends BbbCoreMsg
case class GetCurrentPollRespMsgBody(userId: String, hasPoll: Boolean, poll: Option[PollVO])

object HidePollResultReqMsg { val NAME = "HidePollResultReqMsg" }
case class HidePollResultReqMsg(header: BbbClientMsgHeader, body: HidePollResultReqMsgBody) extends StandardMsg
case class HidePollResultReqMsgBody(requesterId: String, pollId: String)

object PollHideResultEvtMsg { val NAME = "PollHideResultEvtMsg" }
case class PollHideResultEvtMsg(header: BbbClientMsgHeader, body: PollHideResultEvtMsgBody) extends BbbCoreMsg
case class PollHideResultEvtMsgBody(userId: String, pollId: String)

object PollShowResultEvtMsg { val NAME = "PollShowResultEvtMsg" }
case class PollShowResultEvtMsg(header: BbbClientMsgHeader, body: PollShowResultEvtMsgBody) extends BbbCoreMsg
case class PollShowResultEvtMsgBody(userId: String, pollId: String, poll: SimplePollResultOutVO)

object PollStartedEvtMsg { val NAME = "PollStartedEvtMsg" }
case class PollStartedEvtMsg(header: BbbClientMsgHeader, body: PollStartedEvtMsgBody) extends BbbCoreMsg
case class PollStartedEvtMsgBody(userId: String, pollId: String, poll: SimplePollOutVO)

object PollStoppedEvtMsg { val NAME = "PollStoppedEvtMsg" }
case class PollStoppedEvtMsg(header: BbbClientMsgHeader, body: PollStoppedEvtMsgBody) extends BbbCoreMsg
case class PollStoppedEvtMsgBody(userId: String, pollId: String)

object RespondToPollReqMsg { val NAME = "RespondToPollReqMsg" }
case class RespondToPollReqMsg(header: BbbClientMsgHeader, body: RespondToPollReqMsgBody) extends StandardMsg
case class RespondToPollReqMsgBody(requesterId: String, pollId: String, questionId: Int, answerId: Int)

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

object UserRespondedToPollEvtMsg { val NAME = "UserRespondedToPollEvtMsg" }
case class UserRespondedToPollEvtMsg(header: BbbClientMsgHeader, body: UserRespondedToPollEvtMsgBody) extends BbbCoreMsg
case class UserRespondedToPollEvtMsgBody(presenterId: String, pollId: String, poll: SimplePollResultOutVO)


