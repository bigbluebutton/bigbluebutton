package org.bigbluebutton.core.apps.externalvideo

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.{ LiveMeeting }

trait StopExternalVideoPubMsgHdlr {
  this: ExternalVideoApp2x =>

  def handle(msg: StopExternalVideoPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    log.info("Received StopExternalVideoPubMsgr meetingId={}", liveMeeting.props.meetingProp.intId)

    def broadcastEvent() {

      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, liveMeeting.props.meetingProp.intId, "nodeJSapp")
      val envelope = BbbCoreEnvelope(StopExternalVideoEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(StopExternalVideoEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = StopExternalVideoEvtMsgBody()
      val event = StopExternalVideoEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    broadcastEvent()
  }
}
