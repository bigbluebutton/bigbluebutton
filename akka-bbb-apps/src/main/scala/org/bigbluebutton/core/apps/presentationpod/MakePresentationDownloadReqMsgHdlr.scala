package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.api.{ CapturePresentationReqInternalMsg, CaptureSharedNotesReqInternalMsg }
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.apps.presentationpod.PresentationSender
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.util.RandomStringGenerator
import org.bigbluebutton.core.models.{ PresentationInPod, PresentationPage, PresentationPod }

import java.io.File

trait MakePresentationDownloadReqMsgHdlr extends RightsManagementTrait {
  this: PresentationPodHdlrs =>

  object JobTypes {
    val DOWNLOAD = "PresentationWithAnnotationDownloadJob"
    val CAPTURE_PRESENTATION = "PresentationWithAnnotationExportJob"
    val CAPTURE_NOTES = "PadCaptureJob"
  }

  def buildStoreAnnotationsInRedisSysMsg(annotations: StoredAnnotations, liveMeeting: LiveMeeting): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(StoreAnnotationsInRedisSysMsg.NAME, routing)
    val body = StoreAnnotationsInRedisSysMsgBody(annotations)
    val header = BbbCoreHeaderWithMeetingId(StoreAnnotationsInRedisSysMsg.NAME, liveMeeting.props.meetingProp.intId)
    val event = StoreAnnotationsInRedisSysMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildStoreExportJobInRedisSysMsg(exportJob: ExportJob, liveMeeting: LiveMeeting): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(StoreExportJobInRedisSysMsg.NAME, routing)
    val body = StoreExportJobInRedisSysMsgBody(exportJob)
    val header = BbbCoreHeaderWithMeetingId(StoreExportJobInRedisSysMsg.NAME, liveMeeting.props.meetingProp.intId)
    val event = StoreExportJobInRedisSysMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildNewPresFileAvailable(fileURI: String, presId: String, typeOfExport: String): NewPresFileAvailableMsg = {
    val header = BbbClientMsgHeader(NewPresFileAvailableMsg.NAME, "not-used", "not-used")
    val body = NewPresFileAvailableMsgBody(fileURI, presId, typeOfExport)

    NewPresFileAvailableMsg(header, body)
  }

  def buildBroadcastNewPresFileAvailable(newPresFileAvailableMsg: NewPresFileAvailableMsg, liveMeeting: LiveMeeting): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, "not-used")
    val envelope = BbbCoreEnvelope(PresentationPageConvertedEventMsg.NAME, routing)
    val header = BbbClientMsgHeader(NewPresFileAvailableEvtMsg.NAME, liveMeeting.props.meetingProp.intId, "not-used")
    val body = NewPresFileAvailableEvtMsgBody(fileURI = newPresFileAvailableMsg.body.fileURI, presId = newPresFileAvailableMsg.body.presId,
      typeOfExport = newPresFileAvailableMsg.body.typeOfExport)
    val event = NewPresFileAvailableEvtMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildBroadcastPresentationConversionUpdateEvtMsg(parentMeetingId: String, status: String, presentationId: String, filename: String, temporaryPresentationId: String): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, parentMeetingId, "not-used")
    val envelope = BbbCoreEnvelope(PresentationPageConvertedEventMsg.NAME, routing)
    val header = BbbClientMsgHeader(PresentationConversionUpdateEvtMsg.NAME, parentMeetingId, "not-used")
    val body = PresentationConversionUpdateEvtMsgBody("DEFAULT_PRESENTATION_POD", status, "not-used", presentationId, filename, temporaryPresentationId)
    val event = PresentationConversionUpdateEvtMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildBroadcastPresAnnStatusMsg(presAnnStatusMsg: PresAnnStatusMsg, liveMeeting: LiveMeeting): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, "not-used")
    val envelope = BbbCoreEnvelope(PresentationPageConvertedEventMsg.NAME, routing)
    val header = BbbClientMsgHeader(PresAnnStatusEvtMsg.NAME, liveMeeting.props.meetingProp.intId, "not-used")
    val body = PresAnnStatusEvtMsgBody(presId = presAnnStatusMsg.body.presId, pageNumber = presAnnStatusMsg.body.pageNumber, totalPages = presAnnStatusMsg.body.totalPages, status = presAnnStatusMsg.body.status, error = presAnnStatusMsg.body.error)
    val event = PresAnnStatusEvtMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildPresentationUploadTokenSysPubMsg(parentId: String, userId: String, presentationUploadToken: String, filename: String): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(PresentationUploadTokenSysPubMsg.NAME, routing)
    val header = BbbClientMsgHeader(PresentationUploadTokenSysPubMsg.NAME, parentId, userId)
    val body = PresentationUploadTokenSysPubMsgBody("DEFAULT_PRESENTATION_POD", presentationUploadToken, filename, parentId)
    val event = PresentationUploadTokenSysPubMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, event)
  }

  def getPresentationPagesForExport(pagesRange: List[Int], pageCount: Int, presId: String, currentPres: Option[PresentationInPod], liveMeeting: LiveMeeting, storeAnnotationPages: List[PresentationPageForExport] = List()): List[PresentationPageForExport] = {

    pagesRange match {
      case (pageNumber :: pages) => {

        if (pageNumber >= 1 && pageNumber <= pageCount) {

          val whiteboardId = s"${presId}/${pageNumber.toString}"
          val presentationPage: PresentationPage = currentPres.get.pages(whiteboardId)
          val xOffset: Double = presentationPage.xOffset
          val yOffset: Double = presentationPage.yOffset
          val widthRatio: Double = presentationPage.widthRatio
          val heightRatio: Double = presentationPage.heightRatio
          val whiteboardHistory: Array[AnnotationVO] = liveMeeting.wbModel.getHistory(whiteboardId)

          val page = new PresentationPageForExport(pageNumber, xOffset, yOffset, widthRatio, heightRatio, whiteboardHistory)
          getPresentationPagesForExport(pages, pageCount, presId, currentPres, liveMeeting, storeAnnotationPages :+ page)
        } else {
          getPresentationPagesForExport(pages, pageCount, presId, currentPres, liveMeeting, storeAnnotationPages)
        }
      }

      case _ => storeAnnotationPages
    }
  }

  def handle(m: MakePresentationDownloadReqMsg, state: MeetingState2x, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    val meetingId = liveMeeting.props.meetingProp.intId
    val userId = m.header.userId

    val presentationPods: Vector[PresentationPod] = state.presentationPodManager.getAllPresentationPodsInMeeting()
    val presId: String = m.body.presId match {
      case "" => PresentationPodsApp.getAllPresentationPodsInMeeting(state).flatMap(_.getCurrentPresentation.map(_.id)).mkString
      case _  => m.body.presId
    }

    val currentPres: Option[PresentationInPod] = presentationPods.flatMap(_.getPresentation(presId)).headOption

    if (liveMeeting.props.meetingProp.disabledFeatures.contains("downloadPresentationWithAnnotations")) {
      val reason = "Annotated presentation download disabled for this meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, userId, reason, bus.outGW, liveMeeting)
    } else if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, userId)) {
      val reason = "No permission to download presentation."
      PermissionCheck.ejectUserForFailedPermission(meetingId, userId, reason, bus.outGW, liveMeeting)
    } else if (currentPres.isEmpty) {
      log.error(s"Presentation ${presId} not found in meeting ${meetingId}")
    } else {
      val jobId: String = RandomStringGenerator.randomAlphanumericString(16);
      val allPages: Boolean = m.body.allPages
      val pageCount = currentPres.get.pages.size

      val presLocation = List("var", "bigbluebutton", meetingId, meetingId, presId).mkString(File.separator, File.separator, "");
      val pages: List[Int] = m.body.pages // Desired presentation pages for export
      val pagesRange: List[Int] = if (allPages) (1 to pageCount).toList else pages

      val exportJob: ExportJob = new ExportJob(jobId, JobTypes.DOWNLOAD, "annotated_slides", presId, presLocation, allPages, pagesRange, meetingId, "");
      val storeAnnotationPages: List[PresentationPageForExport] = getPresentationPagesForExport(pagesRange, pageCount, presId, currentPres, liveMeeting);

      val annotationCount: Int = storeAnnotationPages.map(_.annotations.size).sum
      val isOriginalPresentationType = m.body.typeOfExport == "Original"

      if (!isOriginalPresentationType && annotationCount > 0) {
        // Send Export Job to Redis
        val job = buildStoreExportJobInRedisSysMsg(exportJob, liveMeeting)
        bus.outGW.send(job)

        // Send Annotations to Redis
        val annotations = StoredAnnotations(jobId, presId, storeAnnotationPages)
        bus.outGW.send(buildStoreAnnotationsInRedisSysMsg(annotations, liveMeeting))
      } else if (!isOriginalPresentationType && annotationCount == 0) {
        log.error("There are no annotations for presentation with Id {}... Ignoring", presId)
      } else if (isOriginalPresentationType) {
        // Return existing uploaded file directly
        val convertedFileName = currentPres.get.filenameConverted
        val filename = if (convertedFileName == "") currentPres.get.name else convertedFileName
        val presFilenameExt = filename.split("\\.").last

        PresentationSender.broadcastSetPresentationDownloadableEvtMsg(bus, meetingId, "DEFAULT_PRESENTATION_POD", "not-used", presId, true, filename)

        val fileURI = List("bigbluebutton", "presentation", "download", meetingId, s"${presId}?presFilename=${presId}.${presFilenameExt}&filename=${filename}").mkString(File.separator, File.separator, "")
        val event = buildNewPresFileAvailable(fileURI, presId, m.body.typeOfExport)

        handle(event, liveMeeting, bus)
      }
    }
  }

  def handle(m: CapturePresentationReqInternalMsg, state: MeetingState2x, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    val parentMeetingId: String = m.parentMeetingId
    val meetingId = liveMeeting.props.meetingProp.intId

    val jobId = s"${meetingId}-slides" // Used as the temporaryPresentationId upon upload
    val userId = m.userId

    val presentationPods: Vector[PresentationPod] = state.presentationPodManager.getAllPresentationPodsInMeeting()
    val currentPres: Option[PresentationInPod] = presentationPods.flatMap(_.getCurrentPresentation()).headOption

    val filename = m.filename
    val presentationUploadToken: String = PresentationPodsApp.generateToken("DEFAULT_PRESENTATION_POD", userId)

    // Informs bbb-web about the token so that when we use it to upload the presentation, it is able to look it up in the list of tokens
    bus.outGW.send(buildPresentationUploadTokenSysPubMsg(parentMeetingId, userId, presentationUploadToken, filename))

    if (liveMeeting.props.meetingProp.disabledFeatures.contains("importPresentationWithAnnotationsFromBreakoutRooms")) {
      log.error(s"Capturing breakout rooms slides disabled in meeting ${meetingId}.")
    } else if (currentPres.isEmpty) {
      log.error(s"No presentation set in meeting ${meetingId}")
      bus.outGW.send(buildBroadcastPresentationConversionUpdateEvtMsg(parentMeetingId, "204", jobId, filename, presentationUploadToken))
    } else {
      val allPages: Boolean = m.allPages
      val pageCount = currentPres.get.pages.size

      val presId: String = PresentationPodsApp.getAllPresentationPodsInMeeting(state).flatMap(_.getCurrentPresentation.map(_.id)).mkString
      val presLocation = List("var", "bigbluebutton", meetingId, meetingId, presId).mkString(File.separator, File.separator, "");

      val currentPage: PresentationPage = PresentationInPod.getCurrentPage(currentPres.get).get
      val pagesRange: List[Int] = if (allPages) (1 to pageCount).toList else List(currentPage.num)

      val exportJob: ExportJob = new ExportJob(jobId, JobTypes.CAPTURE_PRESENTATION, filename, presId, presLocation, allPages, pagesRange, parentMeetingId, presentationUploadToken)
      val storeAnnotationPages: List[PresentationPageForExport] = getPresentationPagesForExport(pagesRange, pageCount, presId, currentPres, liveMeeting);

      val annotationCount: Int = storeAnnotationPages.map(_.annotations.size).sum

      if (annotationCount > 0) {
        // Send Export Job to Redis
        val job = buildStoreExportJobInRedisSysMsg(exportJob, liveMeeting)
        bus.outGW.send(job)

        // Send Annotations to Redis
        val annotations = new StoredAnnotations(jobId, presId, storeAnnotationPages)
        bus.outGW.send(buildStoreAnnotationsInRedisSysMsg(annotations, liveMeeting))
      } else {
        // Notify that no content is available to capture
        bus.outGW.send(buildBroadcastPresentationConversionUpdateEvtMsg(parentMeetingId, "204", jobId, filename, presentationUploadToken))
      }
    }
  }

  def handle(m: NewPresFileAvailableMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    log.info("Received NewPresFileAvailableMsg meetingId={} presId={} fileUrl={}", liveMeeting.props.meetingProp.intId, m.body.presId, m.body.fileURI)
    bus.outGW.send(buildBroadcastNewPresFileAvailable(m, liveMeeting))
  }

  def handle(m: CaptureSharedNotesReqInternalMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    val parentMeetingId = liveMeeting.props.meetingProp.intId
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, parentMeetingId, "not-used")
    val envelope = BbbCoreEnvelope(PresentationPageConversionStartedEventMsg.NAME, routing)
    val header = BbbClientMsgHeader(CaptureSharedNotesReqEvtMsg.NAME, parentMeetingId, "not-used")
    val body = CaptureSharedNotesReqEvtMsgBody(m.breakoutId, m.filename)
    val event = CaptureSharedNotesReqEvtMsg(header, body)

    bus.outGW.send(BbbCommonEnvCoreMsg(envelope, event))
  }

  def handle(m: PresAnnStatusMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    bus.outGW.send(buildBroadcastPresAnnStatusMsg(m, liveMeeting))
  }

  def handle(m: PadCapturePubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    val userId: String = "system"
    val jobId: String = s"${m.body.breakoutId}-notes" // Used as the temporaryPresentationId upon upload
    val filename = m.body.filename
    val presentationUploadToken: String = PresentationPodsApp.generateToken("DEFAULT_PRESENTATION_POD", userId)

    bus.outGW.send(buildPresentationUploadTokenSysPubMsg(m.body.parentMeetingId, userId, presentationUploadToken, filename))

    val exportJob = new ExportJob(jobId, JobTypes.CAPTURE_NOTES, filename, m.body.padId, "", true, List(), m.body.parentMeetingId, presentationUploadToken)
    val job = buildStoreExportJobInRedisSysMsg(exportJob, liveMeeting)

    bus.outGW.send(job)
  }
}
