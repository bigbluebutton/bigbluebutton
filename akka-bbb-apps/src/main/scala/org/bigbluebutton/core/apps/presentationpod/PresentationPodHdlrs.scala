package org.bigbluebutton.core.apps.presentationpod

import org.apache.pekko.actor.ActorContext
import org.apache.pekko.event.Logging

class PresentationPodHdlrs(implicit val context: ActorContext)
  extends CreateNewPresentationPodPubMsgHdlr
  with CreateDefaultPresentationPod
  with GetAllPresentationPodsReqMsgHdlr
  with SetCurrentPresentationPubMsgHdlr
  with PresentationConversionCompletedSysPubMsgHdlr
  with PdfConversionInvalidErrorSysPubMsgHdlr
  with SetCurrentPagePubMsgHdlr
  with SetPageInfiniteWhiteboardPubMsgHdlr
  with SetPresenterInDefaultPodInternalMsgHdlr
  with RemovePresentationPubMsgHdlr
  with SetPresentationDownloadablePubMsgHdlr
  with SetPresentationUploadCompletionNotifiedPubMsgHdlr
  with PresentationConversionUpdatePubMsgHdlr
  with PresentationPageGeneratedPubMsgHdlr
  with PresentationPageCountErrorPubMsgHdlr
  with PresentationUploadedFileTooLargeErrorPubMsgHdlr
  with PresentationUploadTokenReqMsgHdlr
  with MakePresentationDownloadReqMsgHdlr
  with ResizeAndMovePagePubMsgHdlr
  with SlideResizedPubMsgHdlr
  with RemovePresentationPodPubMsgHdlr
  with PresentationPageConvertedSysMsgHdlr
  with PresentationPageConversionStartedSysMsgHdlr
  with PresentationConversionEndedSysMsgHdlr
  with PresentationUploadedFileTimeoutErrorPubMsgHdlr
  with PresentationUploadedFileVirusErrorPubMsgHdlr
  with PresentationUploadedFileScanFailedPubMsgHdlr
  with PresentationConversionFailedErrorSysPubMsgHdlr
  with SetPresentationFitToWidthCmdMsgHdlr
  with PresentationHasInvalidMimeTypeErrorPubMsgHdlr
  with PresentationConversionStartedSysPubMsgHdlr
  with PresentationUploadedConversionCancelledErrorPubMsgHdlr {

  val log = Logging(context.system, getClass)
}
