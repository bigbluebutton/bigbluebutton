package org.bigbluebutton.common2.msgs

// In messages
object StartExternalVideoPubMsg { val NAME = "StartExternalVideoPubMsg" }
case class StartExternalVideoPubMsg(header: BbbClientMsgHeader, body: StartExternalVideoPubMsgBody) extends StandardMsg
case class StartExternalVideoPubMsgBody(externalVideoUrl: String)

object UpdateExternalVideoPubMsg { val NAME = "UpdateExternalVideoPubMsg" }
case class UpdateExternalVideoPubMsg(header: BbbClientMsgHeader, body: UpdateExternalVideoPubMsgBody) extends StandardMsg
case class UpdateExternalVideoPubMsgBody(status: String, rate: Double, time: Double, state: Int)

object StopExternalVideoPubMsg { val NAME = "StopExternalVideoPubMsg" }
case class StopExternalVideoPubMsg(header: BbbClientMsgHeader, body: StopExternalVideoPubMsgBody) extends StandardMsg
case class StopExternalVideoPubMsgBody()

// Out messages
object StartExternalVideoEvtMsg { val NAME = "StartExternalVideoEvtMsg" }
case class StartExternalVideoEvtMsg(header: BbbClientMsgHeader, body: StartExternalVideoEvtMsgBody) extends BbbCoreMsg
case class StartExternalVideoEvtMsgBody(externalVideoUrl: String)

object UpdateExternalVideoEvtMsg { val NAME = "UpdateExternalVideoEvtMsg" }
case class UpdateExternalVideoEvtMsg(header: BbbClientMsgHeader, body: UpdateExternalVideoEvtMsgBody) extends BbbCoreMsg
case class UpdateExternalVideoEvtMsgBody(status: String, rate: Double, time: Double, state: Int)

object StopExternalVideoEvtMsg { val NAME = "StopExternalVideoEvtMsg" }
case class StopExternalVideoEvtMsg(header: BbbClientMsgHeader, body: StopExternalVideoEvtMsgBody) extends BbbCoreMsg
case class StopExternalVideoEvtMsgBody()
