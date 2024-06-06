package org.bigbluebutton.common2.msgs

// In messages
object GetCurrentLayoutReqMsg { val NAME = "GetCurrentLayoutReqMsg" }
case class GetCurrentLayoutReqMsg(header: BbbClientMsgHeader, body: GetCurrentLayoutReqMsgBody) extends StandardMsg
case class GetCurrentLayoutReqMsgBody()

object BroadcastLayoutMsg { val NAME = "BroadcastLayoutMsg" }
case class BroadcastLayoutMsg(header: BbbClientMsgHeader, body: BroadcastLayoutMsgBody) extends StandardMsg
case class BroadcastLayoutMsgBody(layout: String, pushLayout: Boolean, presentationIsOpen: Boolean, isResizing: Boolean, cameraPosition: String, focusedCamera: String, presentationVideoRate: Double)

object BroadcastPushLayoutMsg { val NAME = "BroadcastPushLayoutMsg" }
case class BroadcastPushLayoutMsg(header: BbbClientMsgHeader, body: BroadcastPushLayoutMsgBody) extends StandardMsg
case class BroadcastPushLayoutMsgBody(pushLayout: Boolean)

// Out messages
object GetCurrentLayoutRespMsg { val NAME = "GetCurrentLayoutRespMsg" }
case class GetCurrentLayoutRespMsg(header: BbbClientMsgHeader, body: GetCurrentLayoutRespMsgBody) extends BbbCoreMsg
case class GetCurrentLayoutRespMsgBody(layout: String, setByUserId: String)

object BroadcastLayoutEvtMsg { val NAME = "BroadcastLayoutEvtMsg" }
case class BroadcastLayoutEvtMsg(header: BbbClientMsgHeader, body: BroadcastLayoutEvtMsgBody) extends BbbCoreMsg
case class BroadcastLayoutEvtMsgBody(layout: String, pushLayout: Boolean, presentationIsOpen: Boolean, isResizing: Boolean, cameraPosition: String, focusedCamera: String, presentationVideoRate: Double, setByUserId: String)

object BroadcastPushLayoutEvtMsg { val NAME = "BroadcastPushLayoutEvtMsg" }
case class BroadcastPushLayoutEvtMsg(header: BbbClientMsgHeader, body: BroadcastPushLayoutEvtMsgBody) extends BbbCoreMsg
case class BroadcastPushLayoutEvtMsgBody(pushLayout: Boolean, setByUserId: String)
