package org.bigbluebutton.common2.messages.whiteboard

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, StandardMsg}

object GetWhiteboardAccessReqMsg { val NAME = "GetWhiteboardAccessReqMsg"}
case class GetWhiteboardAccessReqMsg(header: BbbClientMsgHeader, body: GetWhiteboardAccessReqMsgBody) extends StandardMsg
case class GetWhiteboardAccessReqMsgBody(requesterId: String)
