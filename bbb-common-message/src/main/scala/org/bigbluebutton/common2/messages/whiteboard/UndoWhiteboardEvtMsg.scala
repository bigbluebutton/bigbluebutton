package org.bigbluebutton.common2.messages.whiteboard

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}

object UndoWhiteboardEvtMsg { val NAME = "UndoWhiteboardEvtMsg" }
case class UndoWhiteboardEvtMsg(header: BbbClientMsgHeader, body: UndoWhiteboardEvtMsgBody) extends BbbCoreMsg
case class UndoWhiteboardEvtMsgBody(whiteboardId: String, userId: String, annotationId: String)
