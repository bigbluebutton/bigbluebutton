package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }

trait SetUserClientTypeCmdMsgHdlr {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleSetUserClientTypeCmdMsg(msg: SetUserClientTypeCmdMsg) {
    for {
      uvo <- Users2x.setUserClientType(liveMeeting.users2x, msg.body.userId, msg.body.clientType)
    } yield {
      sendSetUserClientTypeEvtMsg(outGW, liveMeeting.props.meetingProp.intId, msg.body.userId, msg.body.clientType)
    }
  }

  def sendSetUserClientTypeEvtMsg(outGW: OutMsgRouter, meetingId: String, userId: String, clientType: String): Unit = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(SetUserClientTypeEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(SetUserClientTypeEvtMsg.NAME, meetingId, userId)
    val body = SetUserClientTypeEvtMsgBody(userId, clientType)
    val event = SetUserClientTypeEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
    outGW.send(msgEvent)
  }
}
