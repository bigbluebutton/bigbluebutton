package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }

trait UserScreenSharingStoppedCmdMsgHdlr {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleUserScreenSharingStoppedCmdMsg(msg: UserScreenSharingStoppedCmdMsg) {
    def broadcastUserScreenSharingStopped(): Unit = {
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(UserScreenSharingStoppedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(UserScreenSharingStoppedEvtMsg.NAME, msg.header.meetingId, msg.header.userId)

      val body = UserScreenSharingStoppedEvtMsgBody(msg.body.userId)
      val event = UserScreenSharingStoppedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    broadcastUserScreenSharingStopped()
  }

}