package org.bigbluebutton.common2.messages.whiteboard

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, StandardMsg}

object ClearWhiteboardPubMsg { val NAME = "ClearWhiteboardPubMsg"}
case class ClearWhiteboardPubMsg(header: BbbClientMsgHeader, body: ClearWhiteboardPubMsgBody) extends StandardMsg
case class ClearWhiteboardPubMsgBody(whiteboardId: String)
