package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.api.CapturePresentationReqInternalMsg
import org.bigbluebutton.core.apps.groupchats.GroupChatApp
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.{ ChatMessageDAO, PresPresentationDAO }
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.{ PresentationInPod, PresentationPage, PresentationPod }
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.util.RandomStringGenerator

import java.io.File
import java.net.URI

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

  def buildNewPresFileAvailable(annotatedFileURI: String, originalFileURI: String, convertedFileURI: String,
                                presId: String, fileStateType: String): NewPresFileAvailableMsg = {
    val header = BbbClientMsgHeader(NewPresFileAvailableMsg.NAME, "not-used", "not-used")
    val body = NewPresFileAvailableMsgBody(annotatedFileURI, originalFileURI, convertedFileURI, presId, fileStateType, "")

    NewPresFileAvailableMsg(header, body)
  }

  def buildBroadcastNewPresFileAvailable(newPresFileAvailableMsg: NewPresFileAvailableMsg, liveMeeting: LiveMeeting): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, "not-used")
    val envelope = BbbCoreEnvelope(NewPresFileAvailableEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(NewPresFileAvailableEvtMsg.NAME, liveMeeting.props.meetingProp.intId, "not-used")
    val body = NewPresFileAvailableEvtMsgBody(
      annotatedFileURI = newPresFileAvailableMsg.body.annotatedFileURI,
      originalFileURI = newPresFileAvailableMsg.body.originalFileURI,
      convertedFileURI = newPresFileAvailableMsg.body.convertedFileURI,
      presId = newPresFileAvailableMsg.body.presId,
      fileStateType = newPresFileAvailableMsg.body.fileStateType
    )
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

  def buildPresentationUploadTokenSysPubMsg(parentMeetingId: String, userId: String, presentationUploadToken: String, filename: String, presId: String): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(PresentationUploadTokenSysPubMsg.NAME, routing)
    val header = BbbClientMsgHeader(PresentationUploadTokenSysPubMsg.NAME, parentMeetingId, userId)
    val body = PresentationUploadTokenSysPubMsgBody("DEFAULT_PRESENTATION_POD", presentationUploadToken, filename, parentMeetingId, presId)
    val event = PresentationUploadTokenSysPubMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, event)
  }

  def getPresentationPagesForExport(pagesRange: List[Int], pageCount: Int, presId: String, currentPres: Option[PresentationInPod], liveMeeting: LiveMeeting, storeAnnotationPages: List[PresentationPageForExport] = List()): List[PresentationPageForExport] = {

    pagesRange match {
      case (pageNumber :: pages) => {

        if (pageNumber >= 1 && pageNumber <= pageCount) {

          val whiteboardId = s"${presId}/${pageNumber.toString}"
          val presentationPage: PresentationPage = currentPres.get.pages(whiteboardId)
          val width: Double = presentationPage.width
          val height: Double = presentationPage.height
          val whiteboardHistory: Array[AnnotationVO] = liveMeeting.wbModel.getHistory(whiteboardId)

          val page = new PresentationPageForExport(pageNumber, width, height, whiteboardHistory)
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

    if (liveMeeting.props.meetingProp.disabledFeatures.contains("downloadPresentationWithAnnotations")
      && m.body.fileStateType == "Annotated") {
      val reason = "Annotated presentation download disabled for this meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, userId, reason, bus.outGW, liveMeeting)
    } else if (liveMeeting.props.meetingProp.disabledFeatures.contains("downloadPresentationOriginalFile")
      && m.body.fileStateType == "Original") {
      val reason = "Original presentation download disabled for this meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, userId, reason, bus.outGW, liveMeeting)
    } else if (liveMeeting.props.meetingProp.disabledFeatures.contains("downloadPresentationConvertedToPdf")
      && m.body.fileStateType == "Converted") {
      val reason = "Converted presentation download disabled for this meeting. (PDF format)"
      PermissionCheck.ejectUserForFailedPermission(meetingId, userId, reason, bus.outGW, liveMeeting)
    } else if (permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, userId)) {
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

      val exportJob: ExportJob = new ExportJob(jobId, JobTypes.DOWNLOAD, currentPres.get.name, "annotated_slides", presId, presLocation, allPages, pagesRange, meetingId, "");
      val storeAnnotationPages: List[PresentationPageForExport] = getPresentationPagesForExport(pagesRange, pageCount, presId, currentPres, liveMeeting);

      val isPresentationOriginalOrConverted = m.body.fileStateType == "Original" || m.body.fileStateType == "Converted"

      if (!isPresentationOriginalOrConverted) {
        // Send Export Job to Redis
        val job = buildStoreExportJobInRedisSysMsg(exportJob, liveMeeting)
        bus.outGW.send(job)

        // Send Annotations to Redis
        val annotations = StoredAnnotations(jobId, presId, storeAnnotationPages)
        bus.outGW.send(buildStoreAnnotationsInRedisSysMsg(annotations, liveMeeting))
      } else {
        // Return existing uploaded file directly
        val convertedFileName = new URI(null, null, currentPres.get.filenameConverted, null).getRawPath
        val originalFilename = new URI(null, null, currentPres.get.name, null).getRawPath
        val originalFileExt = originalFilename.split("\\.").last
        val convertedFileExt = if (convertedFileName != "") convertedFileName.split("\\.").last else ""

        val convertedFileURI = if (convertedFileName != "") List("presentation", "download", meetingId,
          s"${presId}?presFilename=${presId}.${convertedFileExt}&filename=$convertedFileName").mkString("", File.separator, "")
        else ""
        val originalFileURI = List("presentation", "download", meetingId,
          s"${presId}?presFilename=${presId}.${originalFileExt}&filename=$originalFilename").mkString("", File.separator, "")

        val event = buildNewPresFileAvailable("", originalFileURI, convertedFileURI, presId,
          m.body.fileStateType)

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
    val presentationId = PresentationPodsApp.generatePresentationId(m.filename)

    // Informs bbb-web about the token so that when we use it to upload the presentation, it is able to look it up in the list of tokens
    bus.outGW.send(buildPresentationUploadTokenSysPubMsg(parentMeetingId, userId, presentationUploadToken, filename, presentationId))

    var pres = new PresentationInPod(presentationId, default = false, current = false, name = filename,
      pages = Map.empty, downloadable = false, downloadFileExtension = "", removable = true, filenameConverted = filename,
      uploadCompleted = false, numPages = 0, errorMsgKey = "", errorDetails = Map.empty)

    if (liveMeeting.props.meetingProp.disabledFeatures.contains("importPresentationWithAnnotationsFromBreakoutRooms")) {
      log.error(s"Capturing breakout rooms slides disabled in meeting ${meetingId}.")
    } else if (currentPres.isEmpty) {
      log.error(s"No presentation set in meeting ${meetingId}")
      pres = pres.copy(errorMsgKey = "204")
      bus.outGW.send(buildBroadcastPresentationConversionUpdateEvtMsg(parentMeetingId, "204", jobId, filename, presentationUploadToken))
      PresPresentationDAO.updateConversionStarted(parentMeetingId, pres)
    } else {
      val allPages: Boolean = m.allPages
      val pageCount = currentPres.get.pages.size

      val presId: String = PresentationPodsApp.getAllPresentationPodsInMeeting(state).flatMap(_.getCurrentPresentation.map(_.id)).mkString
      val presLocation = List("var", "bigbluebutton", meetingId, meetingId, presId).mkString(File.separator, File.separator, "");

      val currentPage: PresentationPage = PresentationInPod.getCurrentPage(currentPres.get).get
      val pagesRange: List[Int] = if (allPages) (1 to pageCount).toList else List(currentPage.num)

      val exportJob: ExportJob = ExportJob(jobId, JobTypes.CAPTURE_PRESENTATION, filename, filename, presId, presLocation, allPages, pagesRange, parentMeetingId, presentationUploadToken)
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
        pres = pres.copy(errorMsgKey = "204")

        // Notify that no content is available to capture
        bus.outGW.send(buildBroadcastPresentationConversionUpdateEvtMsg(parentMeetingId, "204", jobId, filename, presentationUploadToken))
      }

      PresPresentationDAO.updateConversionStarted(parentMeetingId, pres)
    }
  }

  def handle(m: NewPresFileAvailableMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    log.info(
      "Received NewPresFileAvailableMsg meetingId={} presId={}",
      liveMeeting.props.meetingProp.intId, m.body.presId
    )

    if (m.body.fileStateType == "Annotated") {
      val presentationDownloadInfo = Map(
        "fileURI" -> m.body.annotatedFileURI,
        "filename" -> m.body.fileName
      )
      ChatMessageDAO.insertSystemMsg(liveMeeting.props.meetingProp.intId, GroupChatApp.MAIN_PUBLIC_CHAT, "", GroupChatMessageType.PRESENTATION, presentationDownloadInfo, "")
    } else if (m.body.fileStateType == "Converted") {
      PresPresentationDAO.updateDownloadUri(m.body.presId, m.body.convertedFileURI)
    } else if (m.body.fileStateType == "Original") {
      PresPresentationDAO.updateDownloadUri(m.body.presId, m.body.originalFileURI)
    }

    PresPresentationDAO.updateExportToChatStatus(m.body.presId, "EXPORTED")
    bus.outGW.send(buildBroadcastNewPresFileAvailable(m, liveMeeting))
  }

  def handle(m: PresAnnStatusMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    PresPresentationDAO.updateExportToChat(m.body.presId, m.body.status, m.body.pageNumber, m.body.error)
    bus.outGW.send(buildBroadcastPresAnnStatusMsg(m, liveMeeting))
  }
}
