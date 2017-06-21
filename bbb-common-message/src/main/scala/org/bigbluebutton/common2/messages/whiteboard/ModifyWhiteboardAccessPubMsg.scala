package org.bigbluebutton.common2.messages.whiteboard

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, StandardMsg}

object ModifyWhiteboardAccessPubMsg { val NAME = "ModifyWhiteboardAccessPubMsg"}
case class ModifyWhiteboardAccessPubMsg(header: BbbClientMsgHeader, body: ModifyWhiteboardAccessPubMsgBody) extends StandardMsg
case class ModifyWhiteboardAccessPubMsgBody(multiUser: Boolean)
