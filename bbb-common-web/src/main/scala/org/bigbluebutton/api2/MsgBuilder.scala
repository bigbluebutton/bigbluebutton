package org.bigbluebutton.api2

import org.bigbluebutton.api.messaging.converters.messages.{DestroyMeetingMessage, EndMeetingMessage}
import org.bigbluebutton.api2.meeting.RegisterUser
import org.bigbluebutton.common2.domain.{DefaultProps, PageVO, PresentationVO}
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.presentation.messages._


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

  def buildEjectDuplicateUserRequestToAkkaApps(meetingId: String, intUserId: String, name: String, extUserId: String): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(EjectDuplicateUserReqMsg.NAME, routing)
    val header = BbbCoreHeaderWithMeetingId(EjectDuplicateUserReqMsg.NAME, meetingId)
    val body = EjectDuplicateUserReqMsgBody(meetingId = meetingId, intUserId = intUserId,
      name = name, extUserId = extUserId)
    val req = EjectDuplicateUserReqMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, req)
  }

  def buildRegisterUserRequestToAkkaApps(msg: RegisterUser): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(RegisterUserReqMsg.NAME, routing)
    val header = BbbCoreHeaderWithMeetingId(RegisterUserReqMsg.NAME, msg.meetingId)
    val body = RegisterUserReqMsgBody(meetingId = msg.meetingId, intUserId = msg.intUserId,
      name = msg.name, role = msg.role, extUserId = msg.extUserId, authToken = msg.authToken,
      avatarURL = msg.avatarURL, guest = msg.guest, authed = msg.authed, guestStatus = msg.guestStatus)
    val req = RegisterUserReqMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, req)
  }

  def buildCheckAlivePingSysMsg(system: String, timestamp: Long): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(CheckAlivePingSysMsg.NAME, routing)
    val header = BbbCoreBaseHeader(CheckAlivePingSysMsg.NAME)
    val body = CheckAlivePingSysMsgBody(system, timestamp)
    val req = CheckAlivePingSysMsg(header, body)
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

  def buildPresentationConversionUpdateSysPubMsg(msg: OfficeDocConversionProgress): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(PresentationConversionUpdateSysPubMsg.NAME, routing)
    val header = BbbClientMsgHeader(PresentationConversionUpdateSysPubMsg.NAME, msg.meetingId, msg.authzToken)
    val body = PresentationConversionUpdateSysPubMsgBody(podId = msg.podId, messageKey = msg.key,
      code = msg.key, presentationId = msg.presId, presName = msg.filename)
    val req = PresentationConversionUpdateSysPubMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, req)
  }

  def buildPresentationConversionCompletedSysPubMsg(msg: DocPageCompletedProgress): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(PresentationConversionCompletedSysPubMsg.NAME, routing)
    val header = BbbClientMsgHeader(PresentationConversionCompletedSysPubMsg.NAME, msg.meetingId, msg.authzToken)

    val pages = generatePresentationPages(msg.presId, msg.numPages.intValue(), msg.presBaseUrl)
    val presentation = PresentationVO(msg.presId, msg.filename,
      current=msg.current.booleanValue(), pages.values.toVector, msg.downloadable.booleanValue())

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
      val swfUri = presBaseUrl + "/slide/" + i

      val txtUri = presBaseUrl + "/textfiles/" + i
      val svgUri = presBaseUrl + "/svg/" + i

      val p = PageVO(id = id, num = num, thumbUri = thumbnail, swfUri = swfUri,
        txtUri = txtUri, svgUri = svgUri,
        current = current)
      pages += p.id -> p
    }

    pages.toMap
  }

  def buildPresentationPageCountFailedSysPubMsg(msg: DocPageCountFailed): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(PresentationPageCountErrorSysPubMsg.NAME, routing)
    val header = BbbClientMsgHeader(PresentationPageCountErrorSysPubMsg.NAME, msg.meetingId, msg.authzToken)

    val body = PresentationPageCountErrorSysPubMsgBody(podId = msg.podId, messageKey = msg.key,
      code = msg.key, msg.presId, 0, 0, msg.filename)
    val req = PresentationPageCountErrorSysPubMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, req)
  }

  def buildPresentationPageCountExceededSysPubMsg(msg: DocPageCountExceeded): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-web")
    val envelope = BbbCoreEnvelope(PresentationPageCountErrorSysPubMsg.NAME, routing)
    val header = BbbClientMsgHeader(PresentationPageCountErrorSysPubMsg.NAME, msg.meetingId, msg.authzToken)

    val body = PresentationPageCountErrorSysPubMsgBody(podId = msg.podId, messageKey = msg.key,
      code = msg.key, msg.presId, msg.numPages.intValue(), msg.maxNumPages.intValue(), msg.filename)
    val req = PresentationPageCountErrorSysPubMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, req)
  }
}
