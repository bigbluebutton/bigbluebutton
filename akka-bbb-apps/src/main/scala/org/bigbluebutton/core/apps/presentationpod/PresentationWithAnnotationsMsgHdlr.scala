package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.api.{ CapturePresentationReqInternalMsg }
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.util.RandomStringGenerator
import org.bigbluebutton.core.models.{ PresentationPod, PresentationPage, PresentationInPod }
import java.io.File

trait PresentationWithAnnotationsMsgHdlr extends RightsManagementTrait {
  this: PresentationPodHdlrs =>

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

  def buildBroadcastNewPresAnnFileAvailable(newPresAnnFileAvailableMsg: NewPresAnnFileAvailableMsg, liveMeeting: LiveMeeting): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, "not-used")
    val envelope = BbbCoreEnvelope(PresentationPageConvertedEventMsg.NAME, routing)
    val header = BbbClientMsgHeader(NewPresAnnFileAvailableEvtMsg.NAME, liveMeeting.props.meetingProp.intId, "not-used")
    val body = NewPresAnnFileAvailableEvtMsgBody(fileURI = newPresAnnFileAvailableMsg.body.fileURI, presId = newPresAnnFileAvailableMsg.body.presId)
    val event = NewPresAnnFileAvailableEvtMsg(header, body)

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
          val xCamera: Double = presentationPage.xCamera
          val yCamera: Double = presentationPage.yCamera
          val zoom: Double = presentationPage.zoom
          val whiteboardHistory: Array[AnnotationVO] = liveMeeting.wbModel.getHistory(whiteboardId)

          val page = new PresentationPageForExport(pageNumber, xCamera, yCamera, zoom, whiteboardHistory)
          getPresentationPagesForExport(pages, pageCount, presId, currentPres, liveMeeting, storeAnnotationPages :+ page)
        } else {
          getPresentationPagesForExport(pages, pageCount, presId, currentPres, liveMeeting, storeAnnotationPages)
        }
      }

      case _ => storeAnnotationPages
    }
  }

  def handle(m: MakePresentationWithAnnotationDownloadReqMsg, state: MeetingState2x, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

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

      val jobType: String = "PresentationWithAnnotationDownloadJob"
      val jobId: String = RandomStringGenerator.randomAlphanumericString(16);
      val allPages: Boolean = m.body.allPages
      val pageCount = currentPres.get.pages.size

      val presLocation = List("var", "bigbluebutton", meetingId, meetingId, presId).mkString(File.separator, File.separator, "");
      val pages: List[Int] = m.body.pages // Desired presentation pages for export
      val pagesRange: List[Int] = if (allPages) (1 to pageCount).toList else pages

      val exportJob: ExportJob = new ExportJob(jobId, jobType, "annotated_slides", presId, presLocation, allPages, pagesRange, meetingId, "");
      val storeAnnotationPages: List[PresentationPageForExport] = getPresentationPagesForExport(pagesRange, pageCount, presId, currentPres, liveMeeting);

      // Send Export Job to Redis
      val job = buildStoreExportJobInRedisSysMsg(exportJob, liveMeeting)
      bus.outGW.send(job)

      // Send Annotations to Redis
      val annotations = new StoredAnnotations(jobId, presId, storeAnnotationPages)
      bus.outGW.send(buildStoreAnnotationsInRedisSysMsg(annotations, liveMeeting))
    }
  }

  def handle(m: CapturePresentationReqInternalMsg, state: MeetingState2x, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    val meetingId = liveMeeting.props.meetingProp.intId
    val userId = m.userId
    val presentationPods: Vector[PresentationPod] = state.presentationPodManager.getAllPresentationPodsInMeeting()
    val currentPres: Option[PresentationInPod] = presentationPods.flatMap(_.getCurrentPresentation()).headOption

    if (liveMeeting.props.meetingProp.disabledFeatures.contains("importPresentationWithAnnotationsFromBreakoutRooms")) {
      val reason = "Importing slides from breakout rooms disabled for this meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, userId, reason, bus.outGW, liveMeeting)
    } else if (currentPres.isEmpty) {
      log.error(s"No presentation set in meeting ${meetingId}")
    } else {

      val jobId: String = RandomStringGenerator.randomAlphanumericString(16);
      val jobType = "PresentationWithAnnotationExportJob"
      val allPages: Boolean = m.allPages
      val pageCount = currentPres.get.pages.size

      val presId: String = PresentationPodsApp.getAllPresentationPodsInMeeting(state).flatMap(_.getCurrentPresentation.map(_.id)).mkString
      val presLocation = List("var", "bigbluebutton", meetingId, meetingId, presId).mkString(File.separator, File.separator, "");
      val parentMeetingId: String = m.parentMeetingId

      val currentPage: PresentationPage = PresentationInPod.getCurrentPage(currentPres.get).get
      val pagesRange: List[Int] = if (allPages) (1 to pageCount).toList else List(currentPage.num)

      val presentationUploadToken: String = PresentationPodsApp.generateToken("DEFAULT_PRESENTATION_POD", userId)

      // Set filename, checking if it is already in use
      val meetingName: String = liveMeeting.props.meetingProp.name
      val duplicatedCount = presentationPods.flatMap(_.getPresentationsByFilename(meetingName)).size

      val filename = duplicatedCount match {
        case 0 => meetingName
        case _ => s"${meetingName}(${duplicatedCount})"
      }

      // Informs bbb-web about the token so that when we use it to upload the presentation, it is able to look it up in the list of tokens
      bus.outGW.send(buildPresentationUploadTokenSysPubMsg(parentMeetingId, userId, presentationUploadToken, filename))

      val exportJob: ExportJob = new ExportJob(jobId, jobType, filename, presId, presLocation, allPages, pagesRange, parentMeetingId, presentationUploadToken)
      val storeAnnotationPages: List[PresentationPageForExport] = getPresentationPagesForExport(pagesRange, pageCount, presId, currentPres, liveMeeting);

      // Send Export Job to Redis
      val job = buildStoreExportJobInRedisSysMsg(exportJob, liveMeeting)
      bus.outGW.send(job)

      // Send Annotations to Redis
      val annotations = new StoredAnnotations(jobId, presId, storeAnnotationPages)
      bus.outGW.send(buildStoreAnnotationsInRedisSysMsg(annotations, liveMeeting))
    }
  }

  def handle(m: NewPresAnnFileAvailableMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    log.info("Received NewPresAnnFileAvailableMsg meetingId={} presId={} fileUrl={}", liveMeeting.props.meetingProp.intId, m.body.presId, m.body.fileURI)

    bus.outGW.send(buildBroadcastNewPresAnnFileAvailable(m, liveMeeting))

  }

}
