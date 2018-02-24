package org.bigbluebutton.common2.msgs

import org.bigbluebutton.common2.domain.{PresentationPodVO, PresentationVO}


// ------------ client to akka-apps ------------
object CreateNewPresentationPodPubMsg { val NAME = "CreateNewPresentationPodPubMsg"}
case class CreateNewPresentationPodPubMsg(header: BbbClientMsgHeader, body: CreateNewPresentationPodPubMsgBody) extends StandardMsg
case class CreateNewPresentationPodPubMsgBody()

object RemovePresentationPodPubMsg { val NAME = "RemovePresentationPodPubMsg"}
case class RemovePresentationPodPubMsg(header: BbbClientMsgHeader, body: RemovePresentationPodPubMsgBody) extends StandardMsg
case class RemovePresentationPodPubMsgBody(podId: String)

object PresentationUploadTokenReqMsg { val NAME = "PresentationUploadTokenReqMsg"}
case class PresentationUploadTokenReqMsg(header: BbbClientMsgHeader, body: PresentationUploadTokenReqMsgBody) extends StandardMsg
case class PresentationUploadTokenReqMsgBody(podId: String, filename: String)

object GetAllPresentationPodsReqMsg { val NAME = "GetAllPresentationPodsReqMsg"}
case class GetAllPresentationPodsReqMsg(header: BbbClientMsgHeader, body: GetAllPresentationPodsReqMsgBody) extends StandardMsg
case class GetAllPresentationPodsReqMsgBody()

object SetCurrentPagePubMsg { val NAME = "SetCurrentPagePubMsg"}
case class SetCurrentPagePubMsg(header: BbbClientMsgHeader, body: SetCurrentPagePubMsgBody) extends StandardMsg
case class SetCurrentPagePubMsgBody(podId: String, presentationId: String, pageId: String)

object SetPresenterInPodReqMsg { val NAME = "SetPresenterInPodReqMsg"}
case class SetPresenterInPodReqMsg(header: BbbClientMsgHeader, body: SetPresenterInPodReqMsgBody) extends StandardMsg
case class SetPresenterInPodReqMsgBody(podId: String, nextPresenterId: String)

object RemovePresentationPubMsg { val NAME = "RemovePresentationPubMsg"}
case class RemovePresentationPubMsg(header: BbbClientMsgHeader, body: RemovePresentationPubMsgBody) extends StandardMsg
case class RemovePresentationPubMsgBody(podId: String, presentationId: String)

object SetPresentationDownloadablePubMsg { val NAME = "SetPresentationDownloadablePubMsg"}
case class SetPresentationDownloadablePubMsg(header: BbbClientMsgHeader, body: SetPresentationDownloadablePubMsgBody) extends StandardMsg
case class SetPresentationDownloadablePubMsgBody(podId: String, presentationId: String, downloadable:Boolean)


object ResizeAndMovePagePubMsg { val NAME = "ResizeAndMovePagePubMsg"}
case class ResizeAndMovePagePubMsg(header: BbbClientMsgHeader, body: ResizeAndMovePagePubMsgBody) extends StandardMsg
case class ResizeAndMovePagePubMsgBody(podId: String, presentationId: String, pageId: String, xOffset: Double,
                                       yOffset: Double, widthRatio: Double, heightRatio: Double)

object SetCurrentPresentationPubMsg { val NAME = "SetCurrentPresentationPubMsg"}
case class SetCurrentPresentationPubMsg(header: BbbClientMsgHeader, body: SetCurrentPresentationPubMsgBody) extends StandardMsg
case class SetCurrentPresentationPubMsgBody(podId: String, presentationId: String)
// ------------ client to akka-apps ------------


// ------------ bbb-common-web to akka-apps ------------
object PresentationConversionUpdateSysPubMsg { val NAME = "PresentationConversionUpdateSysPubMsg"}
case class PresentationConversionUpdateSysPubMsg(header: BbbClientMsgHeader,
                                                 body: PresentationConversionUpdateSysPubMsgBody) extends StandardMsg
case class PresentationConversionUpdateSysPubMsgBody(podId: String,
                                                     messageKey: String,
                                                     code: String,
                                                     presentationId: String,
                                                     presName: String)

object PresentationPageCountErrorSysPubMsg { val NAME = "PresentationPageCountErrorSysPubMsg"}
case class PresentationPageCountErrorSysPubMsg(header: BbbClientMsgHeader,
                                               body: PresentationPageCountErrorSysPubMsgBody) extends StandardMsg
case class PresentationPageCountErrorSysPubMsgBody(podId: String, messageKey: String, code: String, presentationId: String,
                                                   numberOfPages: Int, maxNumberPages: Int, presName: String)

object PresentationPageGeneratedSysPubMsg { val NAME = "PresentationPageGeneratedSysPubMsg"}
case class PresentationPageGeneratedSysPubMsg(header: BbbClientMsgHeader,
                                              body: PresentationPageGeneratedSysPubMsgBody) extends StandardMsg
case class PresentationPageGeneratedSysPubMsgBody(podId: String, messageKey: String, code: String, presentationId: String,
                                                  numberOfPages: Int, pagesCompleted: Int, presName: String)

object PresentationConversionCompletedSysPubMsg { val NAME = "PresentationConversionCompletedSysPubMsg"}
case class PresentationConversionCompletedSysPubMsg(header: BbbClientMsgHeader,
                                                    body: PresentationConversionCompletedSysPubMsgBody) extends StandardMsg
case class PresentationConversionCompletedSysPubMsgBody(podId: String, messageKey: String, code: String,
                                                        presentation: PresentationVO)
// ------------ bbb-common-web to akka-apps ------------


// ------------ akka-apps to client ------------
object CreateNewPresentationPodEvtMsg { val NAME = "CreateNewPresentationPodEvtMsg"}
case class CreateNewPresentationPodEvtMsg(header: BbbClientMsgHeader, body: CreateNewPresentationPodEvtMsgBody) extends StandardMsg
case class CreateNewPresentationPodEvtMsgBody(currentPresenterId: String, podId: String)

object RemovePresentationPodEvtMsg { val NAME = "RemovePresentationPodEvtMsg"}
case class RemovePresentationPodEvtMsg(header: BbbClientMsgHeader, body: RemovePresentationPodEvtMsgBody) extends StandardMsg
case class RemovePresentationPodEvtMsgBody(podId: String)

object PresentationUploadTokenPassRespMsg { val NAME = "PresentationUploadTokenPassRespMsg"}
case class PresentationUploadTokenPassRespMsg(header: BbbClientMsgHeader, body: PresentationUploadTokenPassRespMsgBody) extends StandardMsg
case class PresentationUploadTokenPassRespMsgBody(podId: String, authzToken: String, filename: String)

object PresentationUploadTokenFailRespMsg { val NAME = "PresentationUploadTokenFailRespMsg"}
case class PresentationUploadTokenFailRespMsg(header: BbbClientMsgHeader, body: PresentationUploadTokenFailRespMsgBody) extends StandardMsg
case class PresentationUploadTokenFailRespMsgBody(podId: String, filename: String)

object PresentationConversionUpdateEvtMsg { val NAME = "PresentationConversionUpdateEvtMsg"}
case class PresentationConversionUpdateEvtMsg(header: BbbClientMsgHeader, body: PresentationConversionUpdateEvtMsgBody) extends BbbCoreMsg
case class PresentationConversionUpdateEvtMsgBody(podId: String, messageKey: String, code: String, presentationId: String, presName: String)

object PresentationPageCountErrorEvtMsg { val NAME = "PresentationPageCountErrorEvtMsg"}
case class PresentationPageCountErrorEvtMsg(header: BbbClientMsgHeader, body: PresentationPageCountErrorEvtMsgBody) extends BbbCoreMsg
case class PresentationPageCountErrorEvtMsgBody(podId: String, messageKey: String, code: String, presentationId: String, numberOfPages: Int, maxNumberPages: Int, presName: String)

object PresentationPageGeneratedEvtMsg { val NAME = "PresentationPageGeneratedEvtMsg"}
case class PresentationPageGeneratedEvtMsg(header: BbbClientMsgHeader, body: PresentationPageGeneratedEvtMsgBody) extends BbbCoreMsg
case class PresentationPageGeneratedEvtMsgBody(podId: String, messageKey: String, code: String, presentationId: String, numberOfPages: Int, pagesCompleted: Int, presName: String)

object PresentationConversionCompletedEvtMsg { val NAME = "PresentationConversionCompletedEvtMsg"}
case class PresentationConversionCompletedEvtMsg(header: BbbClientMsgHeader, body: PresentationConversionCompletedEvtMsgBody) extends BbbCoreMsg
case class PresentationConversionCompletedEvtMsgBody(podId: String, messageKey: String, code: String, presentation: PresentationVO)

object GetAllPresentationPodsRespMsg { val NAME = "GetAllPresentationPodsRespMsg"}
case class GetAllPresentationPodsRespMsg(header: BbbClientMsgHeader, body: GetAllPresentationPodsRespMsgBody) extends StandardMsg
case class GetAllPresentationPodsRespMsgBody(pods: Vector[PresentationPodVO])

object SetCurrentPageEvtMsg { val NAME = "SetCurrentPageEvtMsg"}
case class SetCurrentPageEvtMsg(header: BbbClientMsgHeader, body: SetCurrentPageEvtMsgBody) extends BbbCoreMsg
case class SetCurrentPageEvtMsgBody(podId: String, presentationId: String, pageId: String)

object SetPresenterInPodRespMsg { val NAME = "SetPresenterInPodRespMsg"}
case class SetPresenterInPodRespMsg(header: BbbClientMsgHeader, body: SetPresenterInPodRespMsgBody) extends StandardMsg
case class SetPresenterInPodRespMsgBody(podId: String, nextPresenterId: String)

object RemovePresentationEvtMsg { val NAME = "RemovePresentationEvtMsg"}
case class RemovePresentationEvtMsg(header: BbbClientMsgHeader, body: RemovePresentationEvtMsgBody) extends BbbCoreMsg
case class RemovePresentationEvtMsgBody(podId: String, presentationId: String)

object SetPresentationDownloadableEvtMsg { val NAME = "SetPresentationDownloadableEvtMsg"}
case class SetPresentationDownloadableEvtMsg(header: BbbClientMsgHeader, body: SetPresentationDownloadableEvtMsgBody) extends BbbCoreMsg
case class SetPresentationDownloadableEvtMsgBody(podId: String, presentationId: String, downloadable: Boolean)

object ResizeAndMovePageEvtMsg { val NAME = "ResizeAndMovePageEvtMsg"}
case class ResizeAndMovePageEvtMsg(header: BbbClientMsgHeader, body: ResizeAndMovePageEvtMsgBody) extends BbbCoreMsg
case class ResizeAndMovePageEvtMsgBody(podId: String, presentationId: String, pageId: String, xOffset: Double,
                                       yOffset: Double, widthRatio: Double, heightRatio: Double)

object SetCurrentPresentationEvtMsg { val NAME = "SetCurrentPresentationEvtMsg"}
case class SetCurrentPresentationEvtMsg(header: BbbClientMsgHeader, body: SetCurrentPresentationEvtMsgBody) extends BbbCoreMsg
case class SetCurrentPresentationEvtMsgBody(podId: String, presentationId: String)

// html5 client only
object SyncGetPresentationPodsRespMsg { val NAME = "SyncGetPresentationPodsRespMsg"}
case class SyncGetPresentationPodsRespMsg(header: BbbClientMsgHeader, body: SyncGetPresentationPodsRespMsgBody) extends BbbCoreMsg
case class SyncGetPresentationPodsRespMsgBody(pods: Vector[PresentationPodVO])

// ------------ akka-apps to client ------------


// ------------ akka-apps to bbb-common-web ------------
object PresentationUploadTokenSysPubMsg { val NAME = "PresentationUploadTokenSysPubMsg"}
case class PresentationUploadTokenSysPubMsg(header: BbbClientMsgHeader, body: PresentationUploadTokenSysPubMsgBody) extends BbbCoreMsg
case class PresentationUploadTokenSysPubMsgBody(podId: String, authzToken: String, filename: String)
// ------------ akka-apps to bbb-common-web ------------
