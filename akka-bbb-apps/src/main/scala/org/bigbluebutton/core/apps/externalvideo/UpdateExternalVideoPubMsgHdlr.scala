package org.bigbluebutton.core.apps.externalvideo

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.{ LiveMeeting }

trait UpdateExternalVideoPubMsgHdlr {

  def handle(msg: UpdateExternalVideoPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    def broadcastEvent(msg: UpdateExternalVideoPubMsg) {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, liveMeeting.props.meetingProp.intId, "nodeJSapp")
      val envelope = BbbCoreEnvelope(UpdateExternalVideoEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(UpdateExternalVideoEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = UpdateExternalVideoEvtMsgBody(msg.body.status, msg.body.rate, msg.body.time, msg.body.state)
      val event = UpdateExternalVideoEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    broadcastEvent(msg)
  }
}
