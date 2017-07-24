package org.bigbluebutton.core.apps.layout

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.Layouts
import org.bigbluebutton.core.running.OutMsgRouter

trait LockLayoutMsgHdlr {
  this: LayoutApp2x =>

  val outGW: OutMsgRouter

  def handleLockLayoutMsg(msg: LockLayoutMsg): Unit = {

    def broadcastEvent(msg: LockLayoutMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(LockLayoutEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(LockLayoutEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = LockLayoutEvtMsgBody(msg.header.userId, msg.body.lock, affectedUsers)
      val event = LockLayoutEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      outGW.send(msgEvent)
    }

    Layouts.applyToViewersOnly(msg.body.viewersOnly)
    liveMeeting.lockLayout(msg.body.lock)
    broadcastEvent(msg)

    for {
      newLayout <- msg.body.layout
    } yield {
      Layouts.setCurrentLayout(newLayout)
      sendBroadcastLayoutEvtMsg(msg.header.userId)
    }
  }
}
