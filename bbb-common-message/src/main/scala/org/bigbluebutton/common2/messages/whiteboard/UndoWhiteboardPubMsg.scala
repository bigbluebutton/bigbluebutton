package org.bigbluebutton.common2.messages.whiteboard

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, StandardMsg}

object UndoWhiteboardPubMsg { val NAME = "UndoWhiteboardPubMsg"}
case class UndoWhiteboardPubMsg(header: BbbClientMsgHeader, body: UndoWhiteboardPubMsgBody) extends StandardMsg
case class UndoWhiteboardPubMsgBody(whiteboardId: String)
