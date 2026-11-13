package org.bigbluebutton.common2.msgs

object BroadcastLayoutMsg { val NAME = "BroadcastLayoutMsg" }
case class BroadcastLayoutMsg(header: BbbClientMsgHeader, body: BroadcastLayoutMsgBody) extends StandardMsg
case class BroadcastLayoutMsgBody(layout: String, pushLayout: Boolean, presentationIsOpen: Boolean, isResizing: Boolean, cameraPosition: String, focusedCamera: String, presentationVideoRate: Double)

object BroadcastLayoutEvtMsg { val NAME = "BroadcastLayoutEvtMsg" }
case class BroadcastLayoutEvtMsg(header: BbbClientMsgHeader, body: BroadcastLayoutEvtMsgBody) extends BbbCoreMsg
case class BroadcastLayoutEvtMsgBody(layout: String, pushLayout: Boolean, presentationIsOpen: Boolean, isResizing: Boolean, cameraPosition: String, focusedCamera: String, presentationVideoRate: Double, setByUserId: String)

object BroadcastPushLayoutMsg { val NAME = "BroadcastPushLayoutMsg" }
case class BroadcastPushLayoutMsg(header: BbbClientMsgHeader, body: BroadcastPushLayoutMsgBody) extends StandardMsg
case class BroadcastPushLayoutMsgBody(pushLayout: Boolean)

object BroadcastPushLayoutEvtMsg { val NAME = "BroadcastPushLayoutEvtMsg" }
case class BroadcastPushLayoutEvtMsg(header: BbbClientMsgHeader, body: BroadcastPushLayoutEvtMsgBody) extends BbbCoreMsg
case class BroadcastPushLayoutEvtMsgBody(pushLayout: Boolean, setByUserId: String)

object SetScreenshareAsContentReqMsg { val NAME = "SetScreenshareAsContentReqMsg" }
case class SetScreenshareAsContentReqMsg(header: BbbClientMsgHeader, body: SetScreenshareAsContentReqMsgBody) extends StandardMsg
case class SetScreenshareAsContentReqMsgBody(screenshareAsContent: Boolean)

object SetScreenshareAsContentEvtMsg { val NAME = "SetScreenshareAsContentEvtMsg" }
case class SetScreenshareAsContentEvtMsg(header: BbbClientMsgHeader, body: SetScreenshareAsContentEvtMsgBody) extends StandardMsg
case class SetScreenshareAsContentEvtMsgBody(screenshareAsContent: Boolean)
