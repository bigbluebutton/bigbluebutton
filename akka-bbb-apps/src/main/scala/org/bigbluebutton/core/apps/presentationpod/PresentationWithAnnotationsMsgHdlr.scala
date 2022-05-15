package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.util.RandomStringGenerator
import org.bigbluebutton.core.models.{ PresentationPod, PresentationPage, PresentationInPod }

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

  def buildPresentationUploadTokenSysPubMsg(parentId: String, userId: String, presentationUploadToken: String, filename: String): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(PresentationUploadTokenSysPubMsg.NAME, routing)
    val header = BbbClientMsgHeader(PresentationUploadTokenSysPubMsg.NAME, parentId, userId)
    val body = PresentationUploadTokenSysPubMsgBody("DEFAULT_PRESENTATION_POD", presentationUploadToken, filename, parentId)
    val event = PresentationUploadTokenSysPubMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, event)
  }

  def handleMakePresentationWithAnnotationDownloadReqMsg(m: MakePresentationWithAnnotationDownloadReqMsg, state: MeetingState2x, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    val meetingId = liveMeeting.props.meetingProp.intId

    // Whiteboard ID
    val presId: String = m.body.presId match {
      case "" => PresentationPodsApp.getAllPresentationPodsInMeeting(state).flatMap(_.getCurrentPresentation.map(_.id)).mkString
      case _  => m.body.presId
    }

    val allPages: Boolean = m.body.allPages // Whether or not all pages of the presentation should be exported
    val pages: List[Int] = m.body.pages // Desired presentation pages for export

    // Determine page amount
    val presentationPods: Vector[PresentationPod] = state.presentationPodManager.getAllPresentationPodsInMeeting()

    val currentPres = presentationPods.flatMap(_.getCurrentPresentation()).headOption

    currentPres match {
      case None =>
        log.error(s"No presentation set in meeting ${meetingId}")
        return
      case _ => ()
    }

    val pageCount = currentPres.get.pages.size
    val pagesRange: List[Int] = if (allPages) (1 to pageCount).toList else pages

    var storeAnnotationPages = new Array[PresentationPageForExport](pagesRange.size)
    var resultingPage = 0

    for (pageNumber <- pagesRange) {
      if (pageNumber < 1 || pageNumber > pageCount) {
        println(pagesRange.length)
        log.error(s"Page ${pageNumber} requested for export out of range, aborting")
        return
      }

      var whiteboardId = s"${presId}/${pageNumber.toString}"
      val presentationPage: PresentationPage = currentPres.get.pages(whiteboardId)
      val xCamera: Double = presentationPage.xCamera
      val yCamera: Double = presentationPage.yCamera
      val zoom: Double = presentationPage.zoom
      val whiteboardHistory: Array[AnnotationVO] = liveMeeting.wbModel.getHistory(whiteboardId)

      storeAnnotationPages(resultingPage) = new PresentationPageForExport(pageNumber, xCamera, yCamera, zoom, whiteboardHistory)
      resultingPage += 1
    }

    val jobId = RandomStringGenerator.randomAlphanumericString(16)

    // 1) Send Annotations to Redis
    var annotations = new StoredAnnotations(jobId, presId, storeAnnotationPages)
    bus.outGW.send(buildStoreAnnotationsInRedisSysMsg(annotations, liveMeeting))

    // 2) Insert Export Job in Redis
    val jobType = "PresentationWithAnnotationDownloadJob"
    val presLocation = s"/var/bigbluebutton/${meetingId}/${meetingId}/${presId}"
    val exportJob = new ExportJob(jobId, jobType, "annotated_slides", presId, presLocation, allPages, pagesRange, meetingId, "")
    var job = buildStoreExportJobInRedisSysMsg(exportJob, liveMeeting)
    bus.outGW.send(job)
  }

  def handleExportPresentationWithAnnotationReqMsg(m: ExportPresentationWithAnnotationReqMsg, state: MeetingState2x, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    val meetingId = liveMeeting.props.meetingProp.intId
    val userId = m.header.userId

    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, userId)) {
      val reason = "No permission to export presentation."
      PermissionCheck.ejectUserForFailedPermission(meetingId, userId, reason, bus.outGW, liveMeeting)
      return
    }

    val parentMeetingId: String = m.body.parentMeetingId

    val presId: String = PresentationPodsApp.getAllPresentationPodsInMeeting(state).flatMap(_.getCurrentPresentation.map(_.id)).mkString
    val allPages: Boolean = m.body.allPages

    val presentationPods: Vector[PresentationPod] = state.presentationPodManager.getAllPresentationPodsInMeeting()
    val currentPres = presentationPods.flatMap(_.getCurrentPresentation()).headOption

    currentPres match {
      case None =>
        log.error(s"No presentation set in meeting ${meetingId}")
        return
      case _ => ()
    }

    val currentPage: PresentationPage = PresentationInPod.getCurrentPage(currentPres.get).get

    val pageCount = currentPres.get.pages.size
    val pagesRange: List[Int] = if (allPages) (1 to pageCount).toList else List(currentPage.num)

    var storeAnnotationPages = new Array[PresentationPageForExport](pagesRange.size)
    var resultingPage = 0

    for (pageNumber <- pagesRange) {
      var whiteboardId = s"${presId}/${pageNumber.toString}"
      val presentationPage: PresentationPage = currentPres.get.pages(whiteboardId)
      val xCamera: Double = presentationPage.xCamera
      val yCamera: Double = presentationPage.yCamera
      val zoom: Double = presentationPage.zoom
      val whiteboardHistory: Array[AnnotationVO] = liveMeeting.wbModel.getHistory(whiteboardId)

      storeAnnotationPages(resultingPage) = new PresentationPageForExport(pageNumber, xCamera, yCamera, zoom, whiteboardHistory)
      resultingPage += 1
    }

    val presentationUploadToken: String = PresentationPodsApp.generateToken("DEFAULT_PRESENTATION_POD", userId)
    val jobId = RandomStringGenerator.randomAlphanumericString(16)

    // Set filename, checking if it is already in use
    var filename: String = liveMeeting.props.meetingProp.name
    val duplicatedCount = presentationPods.flatMap(_.getPresentationsByFilename(filename)).size
    filename = duplicatedCount match {
      case 0 => filename
      case _ => s"${filename}(${duplicatedCount})"
    }

    // Informs bbb-web about the token so that when we use it to upload the presentation, it is able to look it up in the list of tokens
    bus.outGW.send(buildPresentationUploadTokenSysPubMsg(parentMeetingId, userId, presentationUploadToken, filename))

    // 1) Send Annotations to Redis
    var annotations = new StoredAnnotations(jobId, presId, storeAnnotationPages)
    bus.outGW.send(buildStoreAnnotationsInRedisSysMsg(annotations, liveMeeting))

    // 2) Insert Export Job in Redis
    val jobType: String = "PresentationWithAnnotationExportJob"
    val presLocation = s"/var/bigbluebutton/${meetingId}/${meetingId}/${presId}"
    val exportJob = new ExportJob(jobId, jobType, filename, presId, presLocation, allPages, pagesRange, parentMeetingId, presentationUploadToken)
    var job = buildStoreExportJobInRedisSysMsg(exportJob, liveMeeting)
    bus.outGW.send(job)
  }

}
