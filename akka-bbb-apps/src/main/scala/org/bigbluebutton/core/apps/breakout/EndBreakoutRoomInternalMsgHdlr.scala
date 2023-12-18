package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.core.api.{ CaptureSharedNotesReqInternalMsg, CapturePresentationReqInternalMsg, EndBreakoutRoomInternalMsg }
import org.bigbluebutton.core.bus.{ BigBlueButtonEvent, InternalEventBus }
import org.bigbluebutton.core.running.{ BaseMeetingActor, HandlerHelpers, LiveMeeting, OutMsgRouter }

trait EndBreakoutRoomInternalMsgHdlr extends HandlerHelpers {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter
  val eventBus: InternalEventBus

  def handleEndBreakoutRoomInternalMsg(msg: EndBreakoutRoomInternalMsg): Unit = {
    if (liveMeeting.props.breakoutProps.captureSlides) {
      val filename = liveMeeting.props.breakoutProps.captureSlidesFilename
      val captureSlidesEvent = BigBlueButtonEvent(msg.breakoutId, CapturePresentationReqInternalMsg("system", msg.parentId, filename))
      eventBus.publish(captureSlidesEvent)
    }

    if (liveMeeting.props.breakoutProps.captureNotes) {
      val filename = liveMeeting.props.breakoutProps.captureNotesFilename
      val captureNotesEvent = BigBlueButtonEvent(msg.parentId, CaptureSharedNotesReqInternalMsg(msg.breakoutId, filename))
      eventBus.publish(captureNotesEvent)
    }

    log.info("Breakout room {} ended by parent meeting {}.", msg.breakoutId, msg.parentId)
    sendEndMeetingDueToExpiry(msg.reason, eventBus, outGW, liveMeeting, "system")
  }
}
