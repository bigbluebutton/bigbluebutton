package org.bigbluebutton.api2

import scala.collection.JavaConverters._
import org.bigbluebutton.api.messaging.converters.messages._
import org.bigbluebutton.api.messaging.messages.{ ChatMessageFromApi, RegisterUserSessionToken }
import org.bigbluebutton.api.service.ServiceUtils;
import org.bigbluebutton.api2.meeting.RegisterUser
import org.bigbluebutton.common2.domain.{ DefaultProps, PageVO, PresentationPageConvertedVO, PresentationVO }
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.presentation.messages._

import java.io.{ BufferedReader, InputStreamReader }
import java.net.URL
import java.nio.charset.StandardCharsets
import java.util.stream.Collectors
import scala.io.Source
import scala.util.Using
import scala.xml.XML

object MsgBuilder {
  def buildDestroyMeetingSysCmdMsg(msg: DestroyMeetingMessage): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(DestroyMeetingSysCmdMsg.NAME, routing)
    val header = BbbCoreBaseHeader(DestroyMeetingSysCmdMsg.NAME)
    val body = DestroyMeetingSysCmdMsgBody(msg.meetingId)
    val req = DestroyMeetingSysCmdMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, req)
  }

  def buildEndMeetingSysCmdMsg(msg: EndMeetingMessage): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(EndMeetingSysCmdMsg.NAME, routing)
    val header = BbbClientMsgHeader(EndMeetingSysCmdMsg.NAME, msg.meetingId, "not-used")
    val body = EndMeetingSysCmdMsgBody(msg.meetingId)
    val req = EndMeetingSysCmdMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, req)
  }

  def buildCreateMeetingRequestToAkkaApps(props: DefaultProps): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(CreateMeetingReqMsg.NAME, routing)
    val header = BbbCoreBaseHeader(CreateMeetingReqMsg.NAME)
    val body = CreateMeetingReqMsgBody(props)
    val req = CreateMeetingReqMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, req)
  }

  def buildRegisterUserRequestToAkkaApps(msg: RegisterUser): BbbCommonEnvCoreMsg = {
    // Check whether the logout Url is not empty and a valid url.
    // If not leave logoutUrl empty. An empty logoutUrl will fallback to the
    // meeting logoutUrl.
    val logoutUrl = Option(msg.logoutUrl)
      .filter(url => url.nonEmpty && ServiceUtils.getValidationService().isValidURL(url))
      .getOrElse("")
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(RegisterUserReqMsg.NAME, routing)
    val header = BbbCoreHeaderWithMeetingId(RegisterUserReqMsg.NAME, msg.meetingId)
    val body = RegisterUserReqMsgBody(meetingId = msg.meetingId, intUserId = msg.intUserId,
      name = msg.name, firstName = msg.firstName, lastName = msg.lastName, role = msg.role, extUserId = msg.extUserId,
      authToken = msg.authToken, sessionToken = msg.sessionToken,
      avatarURL = msg.avatarURL, webcamBackgroundURL = msg.webcamBackgroundURL, bot = msg.bot, guest = msg.guest, authed = msg.authed,
      guestStatus = msg.guestStatus, excludeFromDashboard = msg.excludeFromDashboard, enforceLayout = msg.enforceLayout,
      logoutUrl = logoutUrl, userMetadata = msg.userMetadata)
    val req = RegisterUserReqMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, req)
  }

  def buildRegisterUserSessionTokenRequestToAkkaApps(msg: RegisterUserSessionToken): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(RegisterUserSessionTokenReqMsg.NAME, routing)
    val header = BbbCoreHeaderWithMeetingId(RegisterUserSessionTokenReqMsg.NAME, msg.meetingID)
    val body = RegisterUserSessionTokenReqMsgBody(
      meetingId = msg.meetingID,
      userId = msg.internalUserId,
      sessionToken = msg.sessionToken,
      sessionName = msg.sessionName,
      replaceSessionToken = msg.replaceSessionToken,
      enforceLayout = msg.enforceLayout,
      userSessionMetadata = msg.userSessionMetadata.asScala.toMap
    )
    val req = RegisterUserSessionTokenReqMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, req)
  }

  def buildCheckAlivePingSysMsg(system: String, bbbWebTimestamp: Long, akkaAppsTimestamp: Long): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(CheckAlivePingSysMsg.NAME, routing)
    val header = BbbCoreBaseHeader(CheckAlivePingSysMsg.NAME)
    val body = CheckAlivePingSysMsgBody(system, bbbWebTimestamp, akkaAppsTimestamp)
    val req = CheckAlivePingSysMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, req)
  }

  def generatePresentationPage(presId: String, numPages: Int, presBaseUrl: String, page: Int): PresentationPageConvertedVO = {
    val id = presId + "/" + page
    val current = if (page == 1) true else false
    val thumbUrl = presBaseUrl + "/thumbnail/" + page

    val txtUrl = presBaseUrl + "/textfiles/" + page
    val svgUrl = presBaseUrl + "/svg/" + page
    val pngUrl = presBaseUrl + "/png/" + page

    val urls = Map("thumb" -> thumbUrl, "text" -> txtUrl, "svg" -> svgUrl, "png" -> pngUrl)

    val result = Using.Manager { use =>
      val contentUrl = new URL(txtUrl)
      val stream = use(new InputStreamReader(contentUrl.openStream(), StandardCharsets.UTF_8))
      val reader = use(new BufferedReader(stream))
      val content = reader.lines().collect(Collectors.joining("\n"))

      val svgSource = Source.fromURL(new URL(svgUrl))
      val svgContent = svgSource.mkString
      svgSource.close()

      // XML parser configuration in use disallows the DOCTYPE declaration within the XML document
      // Sanitize the XML content removing DOCTYPE
      val sanitizedSvgContent = "(?i)<!DOCTYPE[^>]*>".r.replaceAllIn(svgContent, "")

      val xmlContent = XML.loadString(sanitizedSvgContent)

      val w = (xmlContent \ "@width").text.replaceAll("[^.0-9]", "")
      val h = (xmlContent \ "@height").text.replaceAll("[^.0-9]", "")

      val width = w.toDouble
      val height = h.toDouble

      PresentationPageConvertedVO(
        id = id,
        num = page,
        urls = urls,
        content = content,
        current = current,
        width = width,
        height = height
      )
    } recover {
      case e: Exception =>
        e.printStackTrace()
        PresentationPageConvertedVO(
          id = id,
          num = page,
          urls = urls,
          content = "",
          current = current
        )
    }

    val presentationPage = result.getOrElse(
      PresentationPageConvertedVO(
        id = id,
        num = page,
        urls = urls,
        content = "",
        current = current
      )
    )

    presentationPage
  }

  def buildPresentationPageConvertedSysMsg(msg: DocPageGeneratedProgress): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(PresentationPageConvertedSysMsg.NAME, routing)
    val header = BbbClientMsgHeader(PresentationPageConvertedSysMsg.NAME, msg.meetingId, msg.authzToken)

    val page = generatePresentationPage(msg.presId, msg.numPages.intValue(), msg.presBaseUrl, msg.page.intValue())

    val body = PresentationPageConvertedSysMsgBody(
      podId = msg.podId,
      messageKey = msg.key,
      code = msg.key,
      presentationId = msg.presId,
      numberOfPages = msg.numPages.intValue(),
      pagesCompleted = msg.pagesCompleted.intValue(),
      presName = msg.filename,
      page
    )
    val req = PresentationPageConvertedSysMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, req)
  }

  def buildPresentationPageGeneratedPubMsg(msg: DocPageGeneratedProgress): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(PresentationPageGeneratedSysPubMsg.NAME, routing)
    val header = BbbClientMsgHeader(PresentationPageGeneratedSysPubMsg.NAME, msg.meetingId, msg.authzToken)

    val body = PresentationPageGeneratedSysPubMsgBody(podId = msg.podId, messageKey = msg.key,
      code = msg.key, presentationId = msg.presId, numberOfPages = msg.numPages.intValue(),
      pagesCompleted = msg.pagesCompleted.intValue(), presName = msg.filename)
    val req = PresentationPageGeneratedSysPubMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, req)
  }

  def buildPresentationConversionUpdateSysPubMsg(msg: DocConversionProgress): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(PresentationConversionUpdateSysPubMsg.NAME, routing)
    val header = BbbClientMsgHeader(PresentationConversionUpdateSysPubMsg.NAME, msg.meetingId, msg.authzToken)
    val body = PresentationConversionUpdateSysPubMsgBody(podId = msg.podId, messageKey = msg.key,
      code = msg.key, presentationId = msg.presId, presName = msg.filename,
      temporaryPresentationId = msg.temporaryPresentationId)
    val req = PresentationConversionUpdateSysPubMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, req)
  }

  def buildPresentationConversionStartedSysPubMsg(msg: DocConversionStarted): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(PresentationConversionStartedSysPubMsg.NAME, routing)
    val header = BbbClientMsgHeader(PresentationConversionStartedSysPubMsg.NAME, msg.meetingId, msg.authzToken)
    val body = PresentationConversionStartedSysPubMsgBody(podId = msg.podId, presentationId = msg.presId,
      presName = msg.filename, temporaryPresentationId = msg.temporaryPresentationId, maxDuration = msg.maxConversionTime)
    val req = PresentationConversionStartedSysPubMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, req)
  }

  def buildOfficeToPdfConversionFailedMsg(msg: OfficeToPdfConversionFailed): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(PresentationConversionFailedErrorSysPubMsg.NAME, routing)
    val header = BbbClientMsgHeader(PresentationConversionFailedErrorSysPubMsg.NAME, msg.meetingId, "notUsed")
    val body = PresentationConversionFailedErrorSysPubMsgBody(podId = msg.podId, messageKey = msg.messageKey,
      presentationId = msg.presentationId, presName = msg.filename, meetingId = msg.meetingId, errorDetail = "OfficeToPdfConversionFailed")
    val req = PresentationConversionFailedErrorSysPubMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, req)
  }

  def buildPresentationConversionEndedSysMsg(msg: DocPageCompletedProgress): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(PresentationConversionEndedSysMsg.NAME, routing)
    val header = BbbClientMsgHeader(PresentationConversionEndedSysMsg.NAME, msg.meetingId, msg.authzToken)

    val body = PresentationConversionEndedSysMsgBody(
      podId = msg.podId,
      presentationId = msg.presId,
      presName = msg.filename
    )
    val req = PresentationConversionEndedSysMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, req)
  }

  def buildPresentationConversionCompletedSysPubMsg(msg: DocPageCompletedProgress): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(PresentationConversionCompletedSysPubMsg.NAME, routing)
    val header = BbbClientMsgHeader(PresentationConversionCompletedSysPubMsg.NAME, msg.meetingId, msg.authzToken)

    val pages = generatePresentationPages(msg.presId, msg.numPages.intValue(), msg.presBaseUrl)
    val presentation = PresentationVO(msg.presId, msg.temporaryPresentationId, msg.filename,
      current = msg.current.booleanValue(), pages.values.toVector, msg.downloadable.booleanValue(),
      msg.removable.booleanValue(),
      defaultPresentation = msg.defaultPresentation, msg.filenameConverted)

    val body = PresentationConversionCompletedSysPubMsgBody(podId = msg.podId, messageKey = msg.key,
      code = msg.key, presentation)
    val req = PresentationConversionCompletedSysPubMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, req)
  }

  def generatePresentationPages(presId: String, numPages: Int, presBaseUrl: String): scala.collection.immutable.Map[String, PageVO] = {
    val pages = new scala.collection.mutable.HashMap[String, PageVO]
    for (i <- 1 to numPages) {
      val id = presId + "/" + i
      val num = i
      val current = if (i == 1) true else false
      val thumbnail = presBaseUrl + "/thumbnail/" + i

      val txtUri = presBaseUrl + "/textfiles/" + i
      val svgUri = presBaseUrl + "/svg/" + i

      val p = PageVO(id = id, num = num, thumbUri = thumbnail,
        txtUri = txtUri, svgUri = svgUri, current = current)
      pages += p.id -> p
    }

    pages.toMap
  }

  def buildPresentationPageCountFailedSysPubMsg(msg: DocPageCountFailed): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(PresentationPageCountErrorSysPubMsg.NAME, routing)
    val header = BbbClientMsgHeader(PresentationPageCountErrorSysPubMsg.NAME, msg.meetingId, msg.authzToken)

    val body = PresentationPageCountErrorSysPubMsgBody(podId = msg.podId, messageKey = msg.key,
      code = msg.key, msg.presId, 0, 0, msg.filename, msg.temporaryPresentationId)
    val req = PresentationPageCountErrorSysPubMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, req)
  }

  def buildPresentationPageCountExceededSysPubMsg(msg: DocPageCountExceeded): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(PresentationPageCountErrorSysPubMsg.NAME, routing)
    val header = BbbClientMsgHeader(PresentationPageCountErrorSysPubMsg.NAME, msg.meetingId, msg.authzToken)

    val body = PresentationPageCountErrorSysPubMsgBody(podId = msg.podId, messageKey = msg.key,
      code = msg.key, msg.presId, msg.numPages.intValue(), msg.maxNumPages.intValue(), msg.filename, msg.temporaryPresentationId)
    val req = PresentationPageCountErrorSysPubMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, req)
  }

  def buildPdfConversionInvalidErrorSysPubMsg(msg: PdfConversionInvalid): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(PdfConversionInvalidErrorSysPubMsg.NAME, routing)
    val header = BbbClientMsgHeader(PdfConversionInvalidErrorSysPubMsg.NAME, msg.meetingId, msg.authzToken)

    val body = PdfConversionInvalidErrorSysPubMsgBody(podId = msg.podId, messageKey = msg.key,
      code = msg.key, msg.presId, msg.bigPageNumber.intValue(), msg.bigPageSize.intValue(), msg.filename)
    val req = PdfConversionInvalidErrorSysPubMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, req)
  }

  def buildPresentationConversionRequestReceivedSysMsg(msg: DocConversionRequestReceived): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(PresentationConversionRequestReceivedSysMsg.NAME, routing)
    val header = BbbClientMsgHeader(PresentationConversionRequestReceivedSysMsg.NAME, msg.meetingId, msg.authzToken)

    val body = PresentationConversionRequestReceivedSysMsgBody(
      podId = msg.podId,
      presentationId = msg.presId,
      temporaryPresentationId = msg.temporaryPresentationId,
      current = msg.current,
      presName = msg.filename,
      downloadable = msg.downloadable,
      removable = msg.removable,
      authzToken = msg.authzToken
    )
    val req = PresentationConversionRequestReceivedSysMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, req)
  }

  def buildPresentationPageConversionStartedSysMsg(msg: DocPageConversionStarted): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(PresentationPageConversionStartedSysMsg.NAME, routing)
    val header = BbbClientMsgHeader(PresentationPageConversionStartedSysMsg.NAME, msg.meetingId, msg.authzToken)

    val body = PresentationPageConversionStartedSysMsgBody(
      podId = msg.podId,
      presentationId = msg.presId,
      current = msg.current,
      default = msg.defaultPresentation,
      presName = msg.filename,
      presFilenameConverted = msg.filenameConverted,
      downloadable = msg.downloadable,
      removable = msg.removable,
      numPages = msg.numPages,
      authzToken = msg.authzToken
    )
    val req = PresentationPageConversionStartedSysMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, req)
  }

  def buildPublishedRecordingSysMsg(msg: PublishedRecordingMessage): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(PublishedRecordingSysMsg.NAME, routing)
    val header = BbbCoreBaseHeader(PublishedRecordingSysMsg.NAME)
    val body = PublishedRecordingSysMsgBody(msg.recordId)
    val req = PublishedRecordingSysMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, req)
  }

  def buildUnpublishedRecordingSysMsg(msg: UnpublishedRecordingMessage): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(UnpublishedRecordingSysMsg.NAME, routing)
    val header = BbbCoreBaseHeader(UnpublishedRecordingSysMsg.NAME)
    val body = UnpublishedRecordingSysMsgBody(msg.recordId)
    val req = UnpublishedRecordingSysMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, req)
  }

  def buildDeletedRecordingSysMsg(msg: DeletedRecordingMessage): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(DeletedRecordingSysMsg.NAME, routing)
    val header = BbbCoreBaseHeader(DeletedRecordingSysMsg.NAME)
    val body = DeletedRecordingSysMsgBody(msg.recordId)
    val req = DeletedRecordingSysMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, req)
  }

  def buildPresentationUploadedFileTooLargeErrorSysMsg(msg: UploadFileTooLargeMessage): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(PresentationUploadedFileTooLargeErrorSysPubMsg.NAME, routing)
    val header = BbbClientMsgHeader(PresentationUploadedFileTooLargeErrorSysPubMsg.NAME, msg.meetingId, msg.authzToken)

    val body = PresentationUploadedFileTooLargeErrorSysPubMsgBody(
      presentationId = msg.presentationId, podId = msg.podId, messageKey = msg.key,
      code = msg.key, presentationName = msg.filename, presentationToken = msg.authzToken, fileSize = msg.uploadedFileSize.intValue(), maxFileSize = msg.maxUploadFileSize
    )

    val req = PresentationUploadedFileTooLargeErrorSysPubMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, req)
  }

  def buildPresentationHasInvalidMimeType(msg: DocInvalidMimeType): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(PresentationHasInvalidMimeTypeErrorSysPubMsg.NAME, routing)
    val header = BbbClientMsgHeader(PresentationHasInvalidMimeTypeErrorSysPubMsg.NAME, msg.meetingId, "not-used")

    val body = PresentationHasInvalidMimeTypeErrorSysPubMsgBody(podId = msg.podId, presentationName = msg.filename,
      temporaryPresentationId = msg.temporaryPresentationId, presentationId = msg.presId, meetingId = msg.meetingId,
      messageKey = msg.messageKey, fileMime = msg.fileMime, fileExtension = msg.fileExtension)

    val req = PresentationHasInvalidMimeTypeErrorSysPubMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, req)
  }

  def buildSendChatMessageFromApi(msg: ChatMessageFromApi): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(SendGroupChatMessageFromApiSysPubMsg.NAME, routing)
    val header = BbbClientMsgHeader(SendGroupChatMessageFromApiSysPubMsg.NAME, msg.meetingId, "not-used")

    val body = SendGroupChatMessageFromApiSysPubMsgBody(
      userName = msg.name, message = msg.message
    )

    val req = SendGroupChatMessageFromApiSysPubMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, req)
  }

  def buildPresentationUploadedFileTimedoutErrorSysMsg(msg: UploadFileTimedoutMessage): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(PresentationUploadedFileTimeoutErrorSysPubMsg.NAME, routing)
    val header = BbbClientMsgHeader(PresentationUploadedFileTimeoutErrorSysPubMsg.NAME, msg.meetingId, "not-used")

    val body = PresentationUploadedFileTimeoutErrorSysPubMsgBody(podId = msg.podId, presentationName = msg.filename,
      page = msg.page, meetingId = msg.meetingId, messageKey = msg.messageKey,
      temporaryPresentationId = msg.temporaryPresentationId, presentationId = msg.presentationId,
      maxNumberOfAttempts = msg.maxNumberOfAttempts)

    val req = PresentationUploadedFileTimeoutErrorSysPubMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, req)
  }

  def buildPresentationUploadedFileVirusErrorSysPubMsg(msg: UploadFileVirusMessage): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(PresentationUploadedFileVirusErrorSysPubMsg.NAME, routing)
    val header = BbbClientMsgHeader(PresentationUploadedFileVirusErrorSysPubMsg.NAME, msg.meetingId, "not-used")

    val body = PresentationUploadedFileVirusErrorSysPubMsgBody(podId = msg.podId, presentationName = msg.filename,
      meetingId = msg.meetingId, messageKey = msg.messageKey, temporaryPresentationId = msg.temporaryPresentationId,
      presentationId = msg.presentationId)

    val req = PresentationUploadedFileVirusErrorSysPubMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, req)
  }

  def buildPresentationUploadedFileScanFailedErrorSysPubMsg(msg: UploadFileScanFailedMessage): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(PresentationUploadedFileScanFailedErrorSysPubMsg.NAME, routing)
    val header = BbbClientMsgHeader(PresentationUploadedFileScanFailedErrorSysPubMsg.NAME, msg.meetingId, "not-used")

    val body = PresentationUploadedFileScanFailedErrorSysPubMsgBody(podId = msg.podId, presentationName = msg.filename,
      meetingId = msg.meetingId, messageKey = msg.messageKey, temporaryPresentationId = msg.temporaryPresentationId,
      presentationId = msg.presentationId)

    val req = PresentationUploadedFileScanFailedErrorSysPubMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, req)
  }

}
