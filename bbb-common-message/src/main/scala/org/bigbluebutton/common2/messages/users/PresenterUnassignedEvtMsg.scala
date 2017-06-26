package org.bigbluebutton.common2.messages.users

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}

object PresenterUnassignedEvtMsg { val NAME = "PresenterUnassignedEvtMsg" }
case class PresenterUnassignedEvtMsg(header: BbbClientMsgHeader, body: PresenterUnassignedEvtMsgBody) extends BbbCoreMsg
case class PresenterUnassignedEvtMsgBody(intId: String, name: String, assignedBy: String)