package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.domain.PresentationVO
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus

object PresentationSender {
  def broadcastSetPresentationDownloadableEvtMsg(
      bus:       MessageBus,
      meetingId: String,
      podId:     String, userId: String,
      presentationId: String,
      downloadable:   Boolean,
      presFilename:   String
  ): Unit = {
    val routing = Routing.addMsgToClientRouting(
      MessageTypes.BROADCAST_TO_MEETING,
      meetingId, userId
    )
    val envelope = BbbCoreEnvelope(SetPresentationDownloadableEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(SetPresentationDownloadableEvtMsg.NAME, meetingId, userId)

    val body = SetPresentationDownloadableEvtMsgBody(podId, presentationId, downloadable, presFilename)
    val event = SetPresentationDownloadableEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
    bus.outGW.send(msgEvent)
  }

  def broadcastPresentationConversionCompletedEvtMsg(
      bus:       MessageBus,
      meetingId: String,
      podId:     String, userId: String, messageKey: String,
      code: String, presentation: PresentationVO
  ): Unit = {
    val routing = Routing.addMsgToClientRouting(
      MessageTypes.BROADCAST_TO_MEETING,
      meetingId, userId
    )
    val envelope = BbbCoreEnvelope(PresentationConversionCompletedEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(PresentationConversionCompletedEvtMsg.NAME, meetingId, userId)

    val body = PresentationConversionCompletedEvtMsgBody(podId, messageKey, code, presentation)
    val event = PresentationConversionCompletedEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
    bus.outGW.send(msgEvent)
  }
}
