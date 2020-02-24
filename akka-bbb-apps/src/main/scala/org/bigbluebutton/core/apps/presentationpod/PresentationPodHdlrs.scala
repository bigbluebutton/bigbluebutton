package org.bigbluebutton.core.apps.presentationpod

import akka.actor.ActorContext
import akka.event.Logging

class PresentationPodHdlrs(implicit val context: ActorContext)
  extends CreateNewPresentationPodPubMsgHdlr
  with CreateDefaultPresentationPod
  with GetAllPresentationPodsReqMsgHdlr
  with SetCurrentPresentationPubMsgHdlr
  with PresentationConversionCompletedSysPubMsgHdlr
  with PdfConversionInvalidErrorSysPubMsgHdlr
  with SetCurrentPagePubMsgHdlr
  with SetPresenterInPodReqMsgHdlr
  with RemovePresentationPubMsgHdlr
  with SetPresentationDownloadablePubMsgHdlr
  with PresentationConversionUpdatePubMsgHdlr
  with PresentationPageGeneratedPubMsgHdlr
  with PresentationPageCountErrorPubMsgHdlr
  with PresentationUploadTokenReqMsgHdlr
  with ResizeAndMovePagePubMsgHdlr
  with SyncGetPresentationPodsMsgHdlr
  with RemovePresentationPodPubMsgHdlr
  with PresentationPageConvertedSysMsgHdlr
  with PresentationPageConversionStartedSysMsgHdlr
  with PresentationConversionEndedSysMsgHdlr {

  val log = Logging(context.system, getClass)
}
