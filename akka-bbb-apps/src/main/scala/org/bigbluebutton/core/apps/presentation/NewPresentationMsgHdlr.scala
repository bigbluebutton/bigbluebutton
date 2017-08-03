package org.bigbluebutton.core.apps.presentation

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.common2.domain.PresentationVO
import org.bigbluebutton.core.running.OutMsgRouter

trait NewPresentationMsgHdlr {
  this: PresentationApp2x =>

  val outGW: OutMsgRouter

  def broadcastNewPresentationEvent(userId: String, presentation: PresentationVO): Unit = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, userId)
    val envelope = BbbCoreEnvelope(NewPresentationEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(NewPresentationEvtMsg.NAME, liveMeeting.props.meetingProp.intId, userId)

    val body = NewPresentationEvtMsgBody(presentation)
    val event = NewPresentationEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
    outGW.send(msgEvent)
  }
}
