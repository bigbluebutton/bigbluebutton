package org.bigbluebutton.common2.msgs

import org.bigbluebutton.common2.domain.{ PageVO, PresentationPageConvertedVO, PresentationPageVO, PresentationPodVO, PresentationVO }

// ------------ client to akka-apps ------------
object CreateNewPresentationPodPubMsg { val NAME = "CreateNewPresentationPodPubMsg" }
case class CreateNewPresentationPodPubMsg(header: BbbClientMsgHeader, body: CreateNewPresentationPodPubMsgBody) extends StandardMsg
case class CreateNewPresentationPodPubMsgBody()

object RemovePresentationPodPubMsg { val NAME = "RemovePresentationPodPubMsg" }
case class RemovePresentationPodPubMsg(header: BbbClientMsgHeader, body: RemovePresentationPodPubMsgBody) extends StandardMsg
case class RemovePresentationPodPubMsgBody(podId: String)

object PresentationUploadTokenReqMsg { val NAME = "PresentationUploadTokenReqMsg" }
case class PresentationUploadTokenReqMsg(header: BbbClientMsgHeader, body: PresentationUploadTokenReqMsgBody) extends StandardMsg
case class PresentationUploadTokenReqMsgBody(podId: String, filename: String, uploadTemporaryId: String)

object GetAllPresentationPodsReqMsg { val NAME = "GetAllPresentationPodsReqMsg" }
case class GetAllPresentationPodsReqMsg(header: BbbClientMsgHeader, body: GetAllPresentationPodsReqMsgBody) extends StandardMsg
case class GetAllPresentationPodsReqMsgBody()

object SetCurrentPagePubMsg { val NAME = "SetCurrentPagePubMsg" }
case class SetCurrentPagePubMsg(header: BbbClientMsgHeader, body: SetCurrentPagePubMsgBody) extends StandardMsg
case class SetCurrentPagePubMsgBody(podId: String, presentationId: String, pageId: String)

object SetPageInfiniteWhiteboardPubMsg { val NAME = "SetPageInfiniteWhiteboardPubMsg" }
case class SetPageInfiniteWhiteboardPubMsg(header: BbbClientMsgHeader, body: SetPageInfiniteWhiteboardPubMsgBody) extends StandardMsg
case class SetPageInfiniteWhiteboardPubMsgBody(pageId: String, infiniteWhiteboard: Boolean)

object RemovePresentationPubMsg { val NAME = "RemovePresentationPubMsg" }
case class RemovePresentationPubMsg(header: BbbClientMsgHeader, body: RemovePresentationPubMsgBody) extends StandardMsg
case class RemovePresentationPubMsgBody(podId: String, presentationId: String)

object SetPresentationDownloadablePubMsg { val NAME = "SetPresentationDownloadablePubMsg" }
case class SetPresentationDownloadablePubMsg(header: BbbClientMsgHeader, body: SetPresentationDownloadablePubMsgBody) extends StandardMsg
case class SetPresentationDownloadablePubMsgBody(podId: String, presentationId: String, downloadable: Boolean,
                                                 fileStateType: String)

object ResizeAndMovePagePubMsg { val NAME = "ResizeAndMovePagePubMsg" }
case class ResizeAndMovePagePubMsg(header: BbbClientMsgHeader, body: ResizeAndMovePagePubMsgBody) extends StandardMsg
case class ResizeAndMovePagePubMsgBody(podId: String, presentationId: String, pageId: String, xOffset: Double,
                                       yOffset: Double, widthRatio: Double, heightRatio: Double, slideNumber: Int)

object SlideResizedPubMsg { val NAME = "SlideResizedPubMsg" }
case class SlideResizedPubMsg(header: BbbClientMsgHeader, body: SlideResizedPubMsgBody) extends StandardMsg
case class SlideResizedPubMsgBody(pageId: String, width: Double, height: Double,
                                       xOffset: Double, yOffset: Double, widthRatio: Double, heightRatio: Double)

object SetCurrentPresentationPubMsg { val NAME = "SetCurrentPresentationPubMsg" }
case class SetCurrentPresentationPubMsg(header: BbbClientMsgHeader, body: SetCurrentPresentationPubMsgBody) extends StandardMsg
case class SetCurrentPresentationPubMsgBody(podId: String, presentationId: String)
// ------------ client to akka-apps ------------

// ------------ bbb-common-web to akka-apps ------------
object PresentationConversionUpdateSysPubMsg { val NAME = "PresentationConversionUpdateSysPubMsg" }
case class PresentationConversionUpdateSysPubMsg(
    header: BbbClientMsgHeader,
    body:   PresentationConversionUpdateSysPubMsgBody
) extends StandardMsg
case class PresentationConversionUpdateSysPubMsgBody(
    podId:                   String,
    messageKey:              String,
    code:                    String,
    presentationId:          String,
    presName:                String,
    temporaryPresentationId: String
)

object PresentationPageCountErrorSysPubMsg { val NAME = "PresentationPageCountErrorSysPubMsg" }
case class PresentationPageCountErrorSysPubMsg(
    header: BbbClientMsgHeader,
    body:   PresentationPageCountErrorSysPubMsgBody
) extends StandardMsg
case class PresentationPageCountErrorSysPubMsgBody(podId: String, messageKey: String, code: String, presentationId: String,
                                                   numberOfPages: Int, maxNumberPages: Int, presName: String, temporaryPresentationId: String)

object PdfConversionInvalidErrorSysPubMsg { val NAME = "PdfConversionInvalidErrorSysPubMsg" }
case class PdfConversionInvalidErrorSysPubMsg(
    header: BbbClientMsgHeader,
    body:   PdfConversionInvalidErrorSysPubMsgBody
) extends StandardMsg
case class PdfConversionInvalidErrorSysPubMsgBody(podId: String, messageKey: String, code: String, presentationId: String,
                                                  bigPageNumber: Int, bigPageSize: Int, presName: String)

object PresentationPageGeneratedSysPubMsg { val NAME = "PresentationPageGeneratedSysPubMsg" }
case class PresentationPageGeneratedSysPubMsg(
    header: BbbClientMsgHeader,
    body:   PresentationPageGeneratedSysPubMsgBody
) extends StandardMsg
case class PresentationPageGeneratedSysPubMsgBody(podId: String, messageKey: String, code: String, presentationId: String,
                                                  numberOfPages: Int, pagesCompleted: Int, presName: String)

object PresentationConversionCompletedSysPubMsg { val NAME = "PresentationConversionCompletedSysPubMsg" }
case class PresentationConversionCompletedSysPubMsg(
    header: BbbClientMsgHeader,
    body:   PresentationConversionCompletedSysPubMsgBody
) extends StandardMsg
case class PresentationConversionCompletedSysPubMsgBody(podId: String, messageKey: String, code: String,
                                                        presentation: PresentationVO)

object PresentationPageConvertedSysMsg { val NAME = "PresentationPageConvertedSysMsg" }
case class PresentationPageConvertedSysMsg(
    header: BbbClientMsgHeader,
    body:   PresentationPageConvertedSysMsgBody
) extends StandardMsg
case class PresentationPageConvertedSysMsgBody(
    podId:          String,
    messageKey:     String,
    code:           String,
    presentationId: String,
    numberOfPages:  Int,
    pagesCompleted: Int,
    presName:       String,
    page:           PresentationPageConvertedVO
)

object PresentationConversionRequestReceivedSysMsg { val NAME = "PresentationConversionRequestReceivedSysMsg" }
case class PresentationConversionRequestReceivedSysMsg(
    header: BbbClientMsgHeader,
    body:   PresentationConversionRequestReceivedSysMsgBody
) extends StandardMsg
case class PresentationConversionRequestReceivedSysMsgBody(
    podId:                   String,
    presentationId:          String,
    temporaryPresentationId: String,
    current:                 Boolean,
    presName:                String,
    downloadable:            Boolean,
    removable:               Boolean,
    authzToken:              String
)

object PresentationPageConversionStartedSysMsg { val NAME = "PresentationPageConversionStartedSysMsg" }
case class PresentationPageConversionStartedSysMsg(
    header: BbbClientMsgHeader,
    body:   PresentationPageConversionStartedSysMsgBody
) extends StandardMsg
case class PresentationPageConversionStartedSysMsgBody(
    podId:          String,
    presentationId: String,
    current:        Boolean,
    default:        Boolean,
    presName:       String,
    presFilenameConverted: String,
    downloadable:   Boolean,
    removable:      Boolean,
    authzToken:     String,
    numPages:       Int
)

object PresentationConversionEndedSysMsg { val NAME = "PresentationConversionEndedSysMsg" }
case class PresentationConversionEndedSysMsg(
    header: BbbClientMsgHeader,
    body:   PresentationConversionEndedSysMsgBody
) extends StandardMsg
case class PresentationConversionEndedSysMsgBody(
    podId:          String,
    presentationId: String,
    presName:       String
)

object PresentationUploadedFileTooLargeErrorSysPubMsg { val NAME = "PresentationUploadedFileTooLargeErrorSysPubMsg" }
case class PresentationUploadedFileTooLargeErrorSysPubMsg(
    header: BbbClientMsgHeader,
    body:   PresentationUploadedFileTooLargeErrorSysPubMsgBody
) extends StandardMsg
case class PresentationUploadedFileTooLargeErrorSysPubMsgBody(
    podId:             String,
    messageKey:        String,
    code:              String,
    presentationName:  String,
    presentationToken: String,
    fileSize:          Int,
    maxFileSize:       Int
)

object PresentationHasInvalidMimeTypeErrorSysPubMsg { val NAME = "PresentationHasInvalidMimeTypeErrorSysPubMsg" }
case class PresentationHasInvalidMimeTypeErrorSysPubMsg(
      header: BbbClientMsgHeader,
      body:   PresentationHasInvalidMimeTypeErrorSysPubMsgBody
) extends StandardMsg
case class PresentationHasInvalidMimeTypeErrorSysPubMsgBody(
    podId:                   String,
    meetingId:               String,
    presentationName:        String,
    temporaryPresentationId: String,
    presentationId:          String,
    messageKey:              String,
    fileMime:              String,
    fileExtension:         String,
)

object PresentationUploadedFileTimeoutErrorSysPubMsg { val NAME = "PresentationUploadedFileTimeoutErrorSysPubMsg" }
case class PresentationUploadedFileTimeoutErrorSysPubMsg(
    header: BbbClientMsgHeader,
    body:   PresentationUploadedFileTimeoutErrorSysPubMsgBody
) extends StandardMsg
case class PresentationUploadedFileTimeoutErrorSysPubMsgBody(
    podId:                   String,
    meetingId:               String,
    presentationName:        String,
    page:                    Int,
    messageKey:              String,
    temporaryPresentationId: String,
    presentationId:          String,
    maxNumberOfAttempts:     Int,
)

object PresentationUploadedFileVirusErrorSysPubMsg { val NAME = "PresentationUploadedFileVirusErrorSysPubMsg" }
case class PresentationUploadedFileVirusErrorSysPubMsg(
  header: BbbClientMsgHeader,
  body: PresentationUploadedFileVirusErrorSysPubMsgBody
) extends StandardMsg
case class PresentationUploadedFileVirusErrorSysPubMsgBody(
  podId: String,
  meetingId: String,
  presentationName: String,
  messageKey: String,
  temporaryPresentationId: String,
  presentationId: String,
)

object PresentationUploadedFileScanFailedErrorSysPubMsg { val NAME = "PresentationUploadedFileScanFailedErrorSysPubMsg" }
case class PresentationUploadedFileScanFailedErrorSysPubMsg(
  header: BbbClientMsgHeader,
  body: PresentationUploadedFileScanFailedErrorSysPubMsgBody
) extends StandardMsg
case class PresentationUploadedFileScanFailedErrorSysPubMsgBody(
  podId: String,
  meetingId: String,
  presentationName: String,
  messageKey: String,
  temporaryPresentationId: String,
  presentationId: String,
)

// ------------ bbb-common-web to akka-apps ------------

// ------------ akka-apps to client ------------
object CreateNewPresentationPodEvtMsg { val NAME = "CreateNewPresentationPodEvtMsg" }
case class CreateNewPresentationPodEvtMsg(header: BbbClientMsgHeader, body: CreateNewPresentationPodEvtMsgBody) extends StandardMsg
case class CreateNewPresentationPodEvtMsgBody(currentPresenterId: String, podId: String)

object RemovePresentationPodEvtMsg { val NAME = "RemovePresentationPodEvtMsg" }
case class RemovePresentationPodEvtMsg(header: BbbClientMsgHeader, body: RemovePresentationPodEvtMsgBody) extends StandardMsg
case class RemovePresentationPodEvtMsgBody(podId: String)

object PdfConversionInvalidErrorEvtMsg { val NAME = "PdfConversionInvalidErrorEvtMsg" }
case class PdfConversionInvalidErrorEvtMsg(header: BbbClientMsgHeader, body: PdfConversionInvalidErrorEvtMsgBody) extends StandardMsg
case class PdfConversionInvalidErrorEvtMsgBody(podId: String, messageKey: String, code: String, presentationId: String, bigPageNumber: Int, bigPageSize: Int, presName: String)

object PresentationUploadTokenPassRespMsg { val NAME = "PresentationUploadTokenPassRespMsg" }
case class PresentationUploadTokenPassRespMsg(header: BbbClientMsgHeader, body: PresentationUploadTokenPassRespMsgBody) extends StandardMsg
case class PresentationUploadTokenPassRespMsgBody(podId: String, authzToken: String, filename: String, temporaryPresentationId: String, presentationId: String)

object PresentationUploadTokenFailRespMsg { val NAME = "PresentationUploadTokenFailRespMsg" }
case class PresentationUploadTokenFailRespMsg(header: BbbClientMsgHeader, body: PresentationUploadTokenFailRespMsgBody) extends StandardMsg
case class PresentationUploadTokenFailRespMsgBody(podId: String, filename: String)

object PresentationConversionUpdateEvtMsg { val NAME = "PresentationConversionUpdateEvtMsg" }
case class PresentationConversionUpdateEvtMsg(header: BbbClientMsgHeader, body: PresentationConversionUpdateEvtMsgBody) extends BbbCoreMsg
case class PresentationConversionUpdateEvtMsgBody(podId: String, messageKey: String, code: String, presentationId: String, presName: String, temporaryPresentationId: String)

object PresentationPageCountErrorEvtMsg { val NAME = "PresentationPageCountErrorEvtMsg" }
case class PresentationPageCountErrorEvtMsg(header: BbbClientMsgHeader, body: PresentationPageCountErrorEvtMsgBody) extends BbbCoreMsg
case class PresentationPageCountErrorEvtMsgBody(podId: String, messageKey: String, code: String, presentationId: String, numberOfPages: Int, maxNumberPages: Int, presName: String, temporaryPresentationId: String)

object PresentationPageGeneratedEvtMsg { val NAME = "PresentationPageGeneratedEvtMsg" }
case class PresentationPageGeneratedEvtMsg(header: BbbClientMsgHeader, body: PresentationPageGeneratedEvtMsgBody) extends BbbCoreMsg
case class PresentationPageGeneratedEvtMsgBody(podId: String, messageKey: String, code: String, presentationId: String, numberOfPages: Int, pagesCompleted: Int, presName: String)

object PresentationPageConvertedEventMsg { val NAME = "PresentationPageConvertedEventMsg" }
case class PresentationPageConvertedEventMsg(
    header: BbbClientMsgHeader,
    body:   PresentationPageConvertedEventMsgBody
) extends BbbCoreMsg
case class PresentationPageConvertedEventMsgBody(
    podId:          String,
    messageKey:     String,
    code:           String,
    presentationId: String,
    numberOfPages:  Int,
    pagesCompleted: Int,
    presName:       String,
    page:           PresentationPageVO
)

object PresentationUploadedFileTooLargeErrorEvtMsg { val NAME = "PresentationUploadedFileTooLargeErrorEvtMsg" }
case class PresentationUploadedFileTooLargeErrorEvtMsg(header: BbbClientMsgHeader, body: PresentationUploadedFileTooLargeErrorEvtMsgBody) extends BbbCoreMsg
case class PresentationUploadedFileTooLargeErrorEvtMsgBody(podId: String, messageKey: String, code: String, presentationName: String, presentationToken: String, fileSize: Int, maxFileSize: Int)

object PresentationHasInvalidMimeTypeErrorEvtMsg { val NAME = "PresentationHasInvalidMimeTypeErrorEvtMsg" }
case class PresentationHasInvalidMimeTypeErrorEvtMsg(header: BbbClientMsgHeader, body: PresentationHasInvalidMimeTypeErrorEvtMsgBody) extends BbbCoreMsg
case class PresentationHasInvalidMimeTypeErrorEvtMsgBody(podId: String, meetingId: String, presentationName: String,
                                                          temporaryPresentationId: String, presentationId: String,
                                                          messageKey: String, fileMime: String, fileExtension: String,
                                                        )

object PresentationUploadedFileTimeoutErrorEvtMsg { val NAME = "PresentationUploadedFileTimeoutErrorEvtMsg" }
case class PresentationUploadedFileTimeoutErrorEvtMsg(header: BbbClientMsgHeader, body: PresentationUploadedFileTimeoutErrorEvtMsgBody) extends BbbCoreMsg
case class PresentationUploadedFileTimeoutErrorEvtMsgBody(podId: String, meetingId: String, presentationName: String,
                                                          page: Int, messageKey: String,
                                                          temporaryPresentationId: String, presentationId: String,
                                                          maxNumberOfAttempts: Int)

object PresentationUploadedFileVirusErrorEvtMsg { val NAME = "PresentationUploadedFileVirusErrorEvtMsg" }
case class PresentationUploadedFileVirusErrorEvtMsg(header: BbbClientMsgHeader, body: PresentationUploadedFileVirusErrorEvtMsgBody) extends BbbCoreMsg
case class PresentationUploadedFileVirusErrorEvtMsgBody(podId: String, meetingId: String, presentationName: String,
                                                        messageKey: String, temporaryPresentationId: String, presentationId: String)

object PresentationUploadedFileScanFailedErrorEvtMsg { val NAME = "PresentationUploadedFileScanFailedErrorEvtMsg"}
case class PresentationUploadedFileScanFailedErrorEvtMsg(header: BbbClientMsgHeader, body: PresentationUploadedFileScanFailedErrorEvtMsgBody) extends BbbCoreMsg
case class PresentationUploadedFileScanFailedErrorEvtMsgBody(podId: String, meetingId: String, presentationName: String,
                                                             messageKey: String, temporaryPresentationId: String, presentationId: String)

object PresentationConversionRequestReceivedEventMsg { val NAME = "PresentationConversionRequestReceivedEventMsg" }
case class PresentationConversionRequestReceivedEventMsg(
    header: BbbClientMsgHeader,
    body:   PresentationConversionRequestReceivedEventMsgBody
) extends StandardMsg
case class PresentationConversionRequestReceivedEventMsgBody(
    podId:          String,
    presentationId: String,
    current:        Boolean,
    presName:       String,
    downloadable:   Boolean,
    removable:      Boolean,
    authzToken:     String
)

object PresentationPageConversionStartedEventMsg { val NAME = "PresentationPageConversionStartedEventMsg" }
case class PresentationPageConversionStartedEventMsg(
    header: BbbClientMsgHeader,
    body:   PresentationPageConversionStartedEventMsgBody
) extends StandardMsg
case class PresentationPageConversionStartedEventMsgBody(
    podId:          String,
    presentationId: String,
    current:        Boolean,
    presName:       String,
    downloadable:   Boolean,
    removable:      Boolean,
    numPages:       Int,
    authzToken:     String
)

object PresentationConversionEndedEventMsg { val NAME = "PresentationConversionEndedEventMsg" }
case class PresentationConversionEndedEventMsg(
    header: BbbClientMsgHeader,
    body:   PresentationConversionEndedEventMsgBody
) extends StandardMsg
case class PresentationConversionEndedEventMsgBody(
    podId:          String,
    presentationId: String,
    presName:       String
)

object PresentationConversionCompletedEvtMsg { val NAME = "PresentationConversionCompletedEvtMsg" }
case class PresentationConversionCompletedEvtMsg(header: BbbClientMsgHeader, body: PresentationConversionCompletedEvtMsgBody) extends BbbCoreMsg
case class PresentationConversionCompletedEvtMsgBody(podId: String, messageKey: String, code: String, presentation: PresentationVO)

object GetAllPresentationPodsRespMsg { val NAME = "GetAllPresentationPodsRespMsg" }
case class GetAllPresentationPodsRespMsg(header: BbbClientMsgHeader, body: GetAllPresentationPodsRespMsgBody) extends StandardMsg
case class GetAllPresentationPodsRespMsgBody(pods: Vector[PresentationPodVO])

object SetCurrentPageEvtMsg { val NAME = "SetCurrentPageEvtMsg" }
case class SetCurrentPageEvtMsg(header: BbbClientMsgHeader, body: SetCurrentPageEvtMsgBody) extends BbbCoreMsg
case class SetCurrentPageEvtMsgBody(podId: String, presentationId: String, pageId: String)

object SetPageInfiniteWhiteboardEvtMsg { val NAME = "SetPageInfiniteWhiteboardEvtMsg" }
case class SetPageInfiniteWhiteboardEvtMsg(header: BbbClientMsgHeader, body: SetPageInfiniteWhiteboardEvtMsgBody) extends BbbCoreMsg
case class SetPageInfiniteWhiteboardEvtMsgBody(pageId: String, infiniteWhiteboard: Boolean)

object SetPresenterInPodRespMsg { val NAME = "SetPresenterInPodRespMsg" }
case class SetPresenterInPodRespMsg(header: BbbClientMsgHeader, body: SetPresenterInPodRespMsgBody) extends StandardMsg
case class SetPresenterInPodRespMsgBody(podId: String, nextPresenterId: String)

object RemovePresentationEvtMsg { val NAME = "RemovePresentationEvtMsg" }
case class RemovePresentationEvtMsg(header: BbbClientMsgHeader, body: RemovePresentationEvtMsgBody) extends BbbCoreMsg
case class RemovePresentationEvtMsgBody(podId: String, presentationId: String)

object SetPresentationDownloadableEvtMsg { val NAME = "SetPresentationDownloadableEvtMsg" }
case class SetPresentationDownloadableEvtMsg(header: BbbClientMsgHeader, body: SetPresentationDownloadableEvtMsgBody) extends BbbCoreMsg
case class SetPresentationDownloadableEvtMsgBody(podId: String, presentationId: String, downloadable: Boolean,
                                                 presFilename: String, downloadableExtension: String)

object ResizeAndMovePageEvtMsg { val NAME = "ResizeAndMovePageEvtMsg" }
case class ResizeAndMovePageEvtMsg(header: BbbClientMsgHeader, body: ResizeAndMovePageEvtMsgBody) extends BbbCoreMsg
case class ResizeAndMovePageEvtMsgBody(podId: String, presentationId: String, pageId: String, xOffset: Double,
                                       yOffset: Double, widthRatio: Double, heightRatio: Double)

object SetCurrentPresentationEvtMsg { val NAME = "SetCurrentPresentationEvtMsg" }
case class SetCurrentPresentationEvtMsg(header: BbbClientMsgHeader, body: SetCurrentPresentationEvtMsgBody) extends BbbCoreMsg
case class SetCurrentPresentationEvtMsgBody(podId: String, presentationId: String)

// ------------ akka-apps to client ------------

// ------------ akka-apps to bbb-common-web ------------
object PresentationUploadTokenSysPubMsg { val NAME = "PresentationUploadTokenSysPubMsg" }
case class PresentationUploadTokenSysPubMsg(header: BbbClientMsgHeader, body: PresentationUploadTokenSysPubMsgBody) extends BbbCoreMsg
case class PresentationUploadTokenSysPubMsgBody(podId: String, authzToken: String, filename: String, meetingId: String, presentationId: String)
// ------------ akka-apps to bbb-common-web ------------
