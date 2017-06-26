package org.bigbluebutton.common2.messages.whiteboard

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}

object SendCursorPositionEvtMsg { val NAME = "SendCursorPositionEvtMsg" }
case class SendCursorPositionEvtMsg(header: BbbClientMsgHeader, body: SendCursorPositionEvtMsgBody) extends BbbCoreMsg
case class SendCursorPositionEvtMsgBody(xPercent: Double, yPercent: Double)
