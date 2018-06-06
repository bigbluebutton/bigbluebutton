package org.bigbluebutton.core.apps.presentationpod

import akka.actor.ActorContext
import akka.event.Logging

class PresentationPodHdlrs(implicit val context: ActorContext)
    extends CreateNewPresentationPodPubMsgHdlr
    with GetAllPresentationPodsReqMsgHdlr
    with SetCurrentPresentationPubMsgHdlr
    with PresentationConversionCompletedSysPubMsgHdlr
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
    with RemovePresentationPodPubMsgHdlr {

  val log = Logging(context.system, getClass)
}
