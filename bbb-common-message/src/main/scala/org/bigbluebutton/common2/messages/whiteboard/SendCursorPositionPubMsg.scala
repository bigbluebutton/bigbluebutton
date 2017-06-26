package org.bigbluebutton.common2.messages.whiteboard

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, StandardMsg}

object SendCursorPositionPubMsg { val NAME = "SendCursorPositionPubMsg"}
case class SendCursorPositionPubMsg(header: BbbClientMsgHeader, body: SendCursorPositionPubMsgBody) extends StandardMsg
case class SendCursorPositionPubMsgBody(xPercent: Double, yPercent: Double)

