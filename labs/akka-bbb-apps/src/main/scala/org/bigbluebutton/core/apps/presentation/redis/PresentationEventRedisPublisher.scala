package org.bigbluebutton.core.apps.presentation.redis

import org.bigbluebutton.core.api.OutMessageListener2
import org.bigbluebutton.conference.service.messaging.redis.MessageSender
import org.bigbluebutton.core.api._
import org.bigbluebutton.conference.service.messaging.MessagingConstants

class PresentationEventRedisPublisher(service: MessageSender) extends OutMessageListener2 {
  def handleMessage(msg: IOutMessage) {
    msg match {
      case msg: ClearPresentationOutMsg => handleClearPresentationOutMsg(msg)
      case msg: RemovePresentationOutMsg => handleRemovePresentationOutMsg(msg)
      case msg: GetPresentationInfoOutMsg => handleGetPresentationInfoOutMsg(msg)
      case msg: SendCursorUpdateOutMsg => handleSendCursorUpdateOutMsg(msg)
      case msg: ResizeAndMoveSlideOutMsg => handleResizeAndMoveSlideOutMsg(msg)
      case msg: GotoSlideOutMsg => handleGotoSlideOutMsg(msg)
      case msg: SharePresentationOutMsg => handleSharePresentationOutMsg(msg)
      case msg: GetSlideInfoOutMsg => handleGetSlideInfoOutMsg(msg)
      case msg: PresentationConversionProgress => handlePresentationConversionProgress(msg)
      case msg: PresentationConversionError => handlePresentationConversionError(msg)
      case msg: PresentationPageGenerated => handlePresentationPageGenerated(msg)
      case msg: PresentationConversionDone => handlePresentationConversionDone(msg)
      case _ => // do nothing
    }
  }

  private def handleClearPresentationOutMsg(msg: ClearPresentationOutMsg) {
    val json = PesentationMessageToJsonConverter.clearPresentationOutMsgToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }

  private def handleRemovePresentationOutMsg(msg: RemovePresentationOutMsg) {
    val json = PesentationMessageToJsonConverter.removePresentationOutMsgToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }

  private def handleGetPresentationInfoOutMsg(msg: GetPresentationInfoOutMsg) {
    val json = PesentationMessageToJsonConverter.getPresentationInfoOutMsgToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }

  private def handleSendCursorUpdateOutMsg(msg: SendCursorUpdateOutMsg) {
    val json = PesentationMessageToJsonConverter.sendCursorUpdateOutMsgToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }

  private def handleResizeAndMoveSlideOutMsg(msg: ResizeAndMoveSlideOutMsg) {
    val json = PesentationMessageToJsonConverter.resizeAndMoveSlideOutMsgToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }

  private def handleGotoSlideOutMsg(msg: GotoSlideOutMsg) {
    val json = PesentationMessageToJsonConverter.gotoSlideOutMsgToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }

  private def handleSharePresentationOutMsg(msg: SharePresentationOutMsg) {
    val json = PesentationMessageToJsonConverter.sharePresentationOutMsgToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }

  private def handleGetSlideInfoOutMsg(msg: GetSlideInfoOutMsg) {
    val json = PesentationMessageToJsonConverter.getSlideInfoOutMsgToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }

  private def handleGetPreuploadedPresentationsOutMsg(msg: GetPreuploadedPresentationsOutMsg) {
    val json = PesentationMessageToJsonConverter.getPreuploadedPresentationsOutMsgToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }

  private def handlePresentationConversionProgress(msg: PresentationConversionProgress) {
    val json = PesentationMessageToJsonConverter.presentationConversionProgressToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }

  private def handlePresentationConversionError(msg: PresentationConversionError) {
    val json = PesentationMessageToJsonConverter.presentationConversionErrorToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }

  private def handlePresentationPageGenerated(msg: PresentationPageGenerated) {
    val json = PesentationMessageToJsonConverter.presentationPageGenerated(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }

  private def handlePresentationConversionDone(msg: PresentationConversionDone) {
    val json = PesentationMessageToJsonConverter.presentationConversionDoneToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }

  private def handlePresentationChanged(msg: PresentationChanged) {
    val json = PesentationMessageToJsonConverter.presentationChangedToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }

  private def handleGetPresentationStatusReply(msg: GetPresentationStatusReply) {
    val json = PesentationMessageToJsonConverter.getPresentationStatusReplyToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }

  private def handlePresentationRemoved(msg: PresentationRemoved) {
    val json = PesentationMessageToJsonConverter.presentationRemovedToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }

  private def handlePageChanged(msg: PageChanged) {
    val json = PesentationMessageToJsonConverter.pageChangedToJson(msg)
    service.send(MessagingConstants.FROM_PRESENTATION_CHANNEL, json)
  }
}