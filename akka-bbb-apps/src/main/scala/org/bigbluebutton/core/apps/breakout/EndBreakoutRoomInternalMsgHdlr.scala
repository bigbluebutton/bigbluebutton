package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.common2.msgs.{ BbbClientMsgHeader, BbbCommonEnvCoreMsg, BbbCoreEnvelope, BbbCoreHeaderWithMeetingId, ExportJob, MessageTypes, PresentationConversionUpdateEvtMsg, PresentationConversionUpdateEvtMsgBody, PresentationConversionUpdateSysPubMsg, PresentationUploadTokenSysPubMsg, PresentationUploadTokenSysPubMsgBody, Routing, StoreExportJobInRedisSysMsg, StoreExportJobInRedisSysMsgBody }
import org.bigbluebutton.core.api.{ CapturePresentationReqInternalMsg, EndBreakoutRoomInternalMsg }
import org.bigbluebutton.core.apps.presentationpod.PresentationPodsApp
import org.bigbluebutton.core.bus.{ BigBlueButtonEvent, InternalEventBus }
import org.bigbluebutton.core.models.Pads
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
      for {
        group <- Pads.getGroup(liveMeeting.pads, "notes")
      } yield {
        val filename = liveMeeting.props.breakoutProps.captureNotesFilename
        val userId: String = "system"
        val jobId: String = s"${msg.breakoutId}-notes" // Used as the temporaryPresentationId upon upload
        val presentationId = PresentationPodsApp.generatePresentationId(filename)

        if (group.rev > 0) {
          //Request upload of the sharedNotes of breakoutRoom
          val presentationUploadToken: String = PresentationPodsApp.generateToken("DEFAULT_PRESENTATION_POD", userId)
          outGW.send(buildPresentationUploadTokenSysPubMsg(msg.parentId, userId, presentationUploadToken, filename, presentationId))

          val exportJob = ExportJob(jobId, "PadCaptureJob", filename, filename, group.padId, "", allPages = true, List(), msg.parentId, presentationUploadToken)
          val job = buildStoreExportJobInRedisSysMsg(exportJob, liveMeeting)
          outGW.send(job)
        } else {
          // Notify that no content is available
          val event = buildPresentationConversionUpdateEvtMsg(msg.parentId, presentationId, filename, jobId)
          outGW.send(event)
        }
      }
    }

    log.info("Breakout room {} ended by parent meeting {}.", msg.breakoutId, msg.parentId)
    sendEndMeetingDueToExpiry(msg.reason, eventBus, outGW, liveMeeting, "system")
  }

  def buildStoreExportJobInRedisSysMsg(exportJob: ExportJob, liveMeeting: LiveMeeting): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(StoreExportJobInRedisSysMsg.NAME, routing)
    val body = StoreExportJobInRedisSysMsgBody(exportJob)
    val header = BbbCoreHeaderWithMeetingId(StoreExportJobInRedisSysMsg.NAME, liveMeeting.props.meetingProp.intId)
    val event = StoreExportJobInRedisSysMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildPresentationUploadTokenSysPubMsg(parentMeetingId: String, userId: String, presentationUploadToken: String, filename: String, presId: String): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(PresentationUploadTokenSysPubMsg.NAME, routing)
    val header = BbbClientMsgHeader(PresentationUploadTokenSysPubMsg.NAME, parentMeetingId, userId)
    val body = PresentationUploadTokenSysPubMsgBody("DEFAULT_PRESENTATION_POD", presentationUploadToken, filename, parentMeetingId, presId)
    val event = PresentationUploadTokenSysPubMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildPresentationConversionUpdateEvtMsg(meetingId: String, presentationId: String, presName: String, temporaryPresentationId: String): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, "system")
    val envelope = BbbCoreEnvelope(PresentationConversionUpdateEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(PresentationConversionUpdateEvtMsg.NAME, meetingId, "system")

    val body = PresentationConversionUpdateEvtMsgBody(
      "DEFAULT_PRESENTATION_POD",
      "204",
      "not-used",
      presentationId,
      presName,
      temporaryPresentationId
    )
    val event = PresentationConversionUpdateEvtMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, event)
  }

}
