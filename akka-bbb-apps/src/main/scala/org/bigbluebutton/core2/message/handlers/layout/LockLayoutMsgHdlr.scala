package org.bigbluebutton.core2.message.handlers.layout

import org.bigbluebutton.common2.messages.Layout._
import org.bigbluebutton.common2.messages._
import org.bigbluebutton.common2.messages.Routing
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models.Layouts
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.MeetingStatus2x

trait LockLayoutMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleLockLayoutMsg(msg: LockLayoutMsg): Unit = {

    def broadcastEvent(msg: LockLayoutMsg): Unit = {

      Layouts.applyToViewersOnly(msg.body.viewersOnly)
      liveMeeting.lockLayout(msg.body.lock)

      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(LockLayoutEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(LockLayoutEvtMsg.NAME, props.meetingProp.intId, msg.header.userId)

      val body = LockLayoutEvtMsgBody(msg.body.meetingId, props.recordProp.record, msg.body.setById, msg.body.lock, affectedUsers)
      val event = LockLayoutEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      outGW.send(msgEvent)

      msg.body.layout foreach { l =>
        Layouts.setCurrentLayout(l)
        broadcastSyncLayout(msg.body.meetingId, msg.body.setById)
      }

      outGW.send(msgEvent)
    }

    def broadcastSyncLayout(meetingId: String, setById: String) {

      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(BroadcastLayoutEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(BroadcastLayoutEvtMsg.NAME, props.meetingProp.intId, msg.header.userId)

      val body = BroadcastLayoutEvtMsgBody(meetingId, props.recordProp.record, setById,
        Layouts.getCurrentLayout(),
        MeetingStatus2x.getPermissions(liveMeeting.status).lockedLayout,
        Layouts.getLayoutSetter(), affectedUsers)
      val event = BroadcastLayoutEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      outGW.send(msgEvent)
    }

    broadcastEvent(msg)
  }
}