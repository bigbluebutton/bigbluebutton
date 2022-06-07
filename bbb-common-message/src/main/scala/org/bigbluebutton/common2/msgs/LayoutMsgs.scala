package org.bigbluebutton.common2.msgs

// In messages
object GetCurrentLayoutReqMsg { val NAME = "GetCurrentLayoutReqMsg" }
case class GetCurrentLayoutReqMsg(header: BbbClientMsgHeader, body: GetCurrentLayoutReqMsgBody) extends StandardMsg
case class GetCurrentLayoutReqMsgBody()

object BroadcastLayoutMsg { val NAME = "BroadcastLayoutMsg" }
case class BroadcastLayoutMsg(header: BbbClientMsgHeader, body: BroadcastLayoutMsgBody) extends StandardMsg
case class BroadcastLayoutMsgBody(layout: String)

// Out messages
object GetCurrentLayoutRespMsg { val NAME = "GetCurrentLayoutRespMsg" }
case class GetCurrentLayoutRespMsg(header: BbbClientMsgHeader, body: GetCurrentLayoutRespMsgBody) extends BbbCoreMsg
case class GetCurrentLayoutRespMsgBody(layout: String, locked: Boolean, setByUserId: String)

object BroadcastLayoutEvtMsg { val NAME = "BroadcastLayoutEvtMsg" }
case class BroadcastLayoutEvtMsg(header: BbbClientMsgHeader, body: BroadcastLayoutEvtMsgBody) extends BbbCoreMsg
case class BroadcastLayoutEvtMsgBody(layout: String, locked: Boolean, setByUserId: String, applyTo: Vector[String])