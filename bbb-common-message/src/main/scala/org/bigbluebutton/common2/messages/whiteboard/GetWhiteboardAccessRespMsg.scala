package org.bigbluebutton.common2.messages.whiteboard

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}

object GetWhiteboardAccessRespMsg { val NAME = "GetWhiteboardAccessRespMsg" }
case class GetWhiteboardAccessRespMsg(header: BbbClientMsgHeader, body: GetWhiteboardAccessRespMsgBody) extends BbbCoreMsg
case class GetWhiteboardAccessRespMsgBody(multiUser: Boolean)
