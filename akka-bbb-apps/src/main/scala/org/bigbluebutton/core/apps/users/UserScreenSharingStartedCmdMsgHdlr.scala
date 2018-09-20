package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }

trait UserScreenSharingStartedCmdMsgHdlr {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleUserScreenSharingStartedCmdMsg(msg: UserScreenSharingStartedCmdMsg) {
    def broadcastUserScreenSharingStarted(): Unit = {
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(UserScreenSharingStartedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(UserScreenSharingStartedEvtMsg.NAME, msg.header.meetingId, msg.header.userId)

      val body = UserScreenSharingStartedEvtMsgBody(msg.body.userId, msg.body.screenSharingType)
      val event = UserScreenSharingStartedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    broadcastUserScreenSharingStarted()
  }

}