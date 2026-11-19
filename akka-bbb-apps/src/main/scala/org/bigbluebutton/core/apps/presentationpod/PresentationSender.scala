package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.domain.PresentationVO
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus

object PresentationSender {
  def broadcastSetCurrentPageEvtMsg(
      bus:            MessageBus,
      meetingId:      String,
      podId:          String,
      presentationId: String,
      pageId:         String,
      pageNum:        Int,
      userId:         String
  ): Unit = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
    val envelope = BbbCoreEnvelope(SetCurrentPageEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(SetCurrentPageEvtMsg.NAME, meetingId, userId)
    val body = SetCurrentPageEvtMsgBody(podId, presentationId, pageId, pageNum)
    bus.outGW.send(BbbCommonEnvCoreMsg(envelope, SetCurrentPageEvtMsg(header, body)))
  }

  def broadcastSetPresentationDownloadableEvtMsg(
      bus:       MessageBus,
      meetingId: String,
      podId:     String,
      userId: String,
      presentationId: String,
      downloadable:   Boolean,
      presFilename:   String,
      downloadableExtension: String
  ): Unit = {
    val routing = Routing.addMsgToClientRouting(
      MessageTypes.BROADCAST_TO_MEETING,
      meetingId, userId
    )
    val envelope = BbbCoreEnvelope(SetPresentationDownloadableEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(SetPresentationDownloadableEvtMsg.NAME, meetingId, userId)

    val body = SetPresentationDownloadableEvtMsgBody(podId, presentationId, downloadable, presFilename, downloadableExtension)
    val event = SetPresentationDownloadableEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
    bus.outGW.send(msgEvent)
  }
  def broadcastPresentationConversionCompletedEvtMsg(
      bus:       MessageBus,
      meetingId: String,
      podId:     String, userId: String, messageKey: String,
      code: String, presentation: PresentationVO,
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
