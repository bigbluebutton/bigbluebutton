package org.bigbluebutton.common2.msgs

/* In Messages  */
object CreateTimerPubMsg { val NAME = "CreateTimerPubMsg" }
case class CreateTimerPubMsg(header: BbbClientMsgHeader, body: CreateTimerPubMsgBody) extends StandardMsg
case class CreateTimerPubMsgBody(stopwatch: Boolean, running: Boolean, time: Int, accumulated: Int, timestamp: Int, track: String)

object ActivateTimerReqMsg { val NAME = "ActivateTimerReqMsg" }
case class ActivateTimerReqMsg(header: BbbClientMsgHeader, body: ActivateTimerReqMsgBody) extends StandardMsg
case class ActivateTimerReqMsgBody(stopwatch: Boolean, running: Boolean, time: Int, accumulated: Int, timestamp: Int, track: String)

object DeactivateTimerReqMsg { val NAME = "DeactivateTimerReqMsg" }
case class DeactivateTimerReqMsg(header: BbbClientMsgHeader, body: DeactivateTimerReqMsgBody) extends StandardMsg
case class DeactivateTimerReqMsgBody()

object StartTimerReqMsg { val NAME = "StartTimerReqMsg" }
case class StartTimerReqMsg(header: BbbClientMsgHeader, body: StartTimerReqMsgBody) extends StandardMsg
case class StartTimerReqMsgBody()

object StopTimerReqMsg { val NAME = "StopTimerReqMsg" }
case class StopTimerReqMsg(header: BbbClientMsgHeader, body: StopTimerReqMsgBody) extends StandardMsg
case class StopTimerReqMsgBody(accumulated: Int)

object SwitchTimerReqMsg { val NAME = "SwitchTimerReqMsg" }
case class SwitchTimerReqMsg(header: BbbClientMsgHeader, body: SwitchTimerReqMsgBody) extends StandardMsg
case class SwitchTimerReqMsgBody(stopwatch: Boolean)

object SetTimerReqMsg { val NAME = "SetTimerReqMsg" }
case class SetTimerReqMsg(header: BbbClientMsgHeader, body: SetTimerReqMsgBody) extends StandardMsg
case class SetTimerReqMsgBody(time: Int)

object ResetTimerReqMsg { val NAME = "ResetTimerReqMsg" }
case class ResetTimerReqMsg(header: BbbClientMsgHeader, body: ResetTimerReqMsgBody) extends StandardMsg
case class ResetTimerReqMsgBody()

object TimerEndedPubMsg { val NAME = "TimerEndedPubMsg" }
case class TimerEndedPubMsg(header: BbbClientMsgHeader, body: TimerEndedPubMsgBody) extends StandardMsg
case class TimerEndedPubMsgBody()

object SetTrackReqMsg { val NAME = "SetTrackReqMsg" }
case class SetTrackReqMsg(header: BbbClientMsgHeader, body: SetTrackReqMsgBody) extends StandardMsg
case class SetTrackReqMsgBody(track: String)

/* Out Messages */
object ActivateTimerRespMsg { val NAME = "ActivateTimerRespMsg" }
case class ActivateTimerRespMsg(header: BbbCoreHeaderWithMeetingId, body: ActivateTimerRespMsgBody) extends BbbCoreMsg
case class ActivateTimerRespMsgBody(userId: String, stopwatch: Boolean, running: Boolean, time: Int, accumulated: Int, track: String)

object DeactivateTimerRespMsg { val NAME = "DeactivateTimerRespMsg" }
case class DeactivateTimerRespMsg(header: BbbCoreHeaderWithMeetingId, body: DeactivateTimerRespMsgBody) extends BbbCoreMsg
case class DeactivateTimerRespMsgBody(userId: String)

object StartTimerRespMsg { val NAME = "StartTimerRespMsg" }
case class StartTimerRespMsg(header: BbbCoreHeaderWithMeetingId, body: StartTimerRespMsgBody) extends BbbCoreMsg
case class StartTimerRespMsgBody(userId: String)

object StopTimerRespMsg { val NAME = "StopTimerRespMsg" }
case class StopTimerRespMsg(header: BbbCoreHeaderWithMeetingId, body: StopTimerRespMsgBody) extends BbbCoreMsg
case class StopTimerRespMsgBody(userId: String, accumulated: Int)

object SwitchTimerRespMsg { val NAME = "SwitchTimerRespMsg" }
case class SwitchTimerRespMsg(header: BbbCoreHeaderWithMeetingId, body: SwitchTimerRespMsgBody) extends BbbCoreMsg
case class SwitchTimerRespMsgBody(userId: String, stopwatch: Boolean)

object SetTimerRespMsg { val NAME = "SetTimerRespMsg" }
case class SetTimerRespMsg(header: BbbCoreHeaderWithMeetingId, body: SetTimerRespMsgBody) extends BbbCoreMsg
case class SetTimerRespMsgBody(userId: String, time: Int)

object ResetTimerRespMsg { val NAME = "ResetTimerRespMsg" }
case class ResetTimerRespMsg(header: BbbCoreHeaderWithMeetingId, body: ResetTimerRespMsgBody) extends BbbCoreMsg
case class ResetTimerRespMsgBody(userId: String)

object TimerEndedEvtMsg { val NAME = "TimerEndedEvtMsg" }
case class TimerEndedEvtMsg(header: BbbCoreHeaderWithMeetingId, body: TimerEndedEvtMsgBody) extends BbbCoreMsg
case class TimerEndedEvtMsgBody()

object SetTrackRespMsg { val NAME = "SetTrackRespMsg" }
case class SetTrackRespMsg(header: BbbCoreHeaderWithMeetingId, body: SetTrackRespMsgBody) extends BbbCoreMsg
case class SetTrackRespMsgBody(userId: String, track: String)
