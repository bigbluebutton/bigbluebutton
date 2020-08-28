package org.bigbluebutton.core.apps.externalvideo

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.{ LiveMeeting }

trait StartExternalVideoPubMsgHdlr {
  this: ExternalVideoApp2x =>

  def handle(msg: StartExternalVideoPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    log.info("Received StartExternalVideoPubMsgr meetingId={} url={}", liveMeeting.props.meetingProp.intId, msg.body.externalVideoUrl)

    def broadcastEvent(msg: StartExternalVideoPubMsg) {

      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, liveMeeting.props.meetingProp.intId, "nodeJSapp")
      val envelope = BbbCoreEnvelope(StartExternalVideoEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(StartExternalVideoEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = StartExternalVideoEvtMsgBody(msg.body.externalVideoUrl)
      val event = StartExternalVideoEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    broadcastEvent(msg)
  }
}
