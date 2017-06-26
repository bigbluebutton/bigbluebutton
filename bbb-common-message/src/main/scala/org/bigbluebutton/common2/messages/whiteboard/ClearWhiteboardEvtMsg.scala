package org.bigbluebutton.common2.messages.whiteboard

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}

object ClearWhiteboardEvtMsg { val NAME = "ClearWhiteboardEvtMsg" }
case class ClearWhiteboardEvtMsg(header: BbbClientMsgHeader, body: ClearWhiteboardEvtMsgBody) extends BbbCoreMsg
case class ClearWhiteboardEvtMsgBody(whiteboardId: String, userId: String, fullClear: Boolean)
