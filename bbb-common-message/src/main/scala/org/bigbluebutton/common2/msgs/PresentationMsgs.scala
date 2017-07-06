package org.bigbluebutton.common2.msgs

import org.bigbluebutton.common2.domain.PresentationVO


  object PresenterAssignedEvtMsg { val NAME = "PresenterAssignedEvtMsg" }
  case class PresenterAssignedEvtMsg(header: BbbClientMsgHeader, body: PresenterAssignedEvtMsgBody) extends BbbCoreMsg
  case class PresenterAssignedEvtMsgBody(presenterId: String, presenterName: String, assignedBy: String)

  object PresenterUnassignedEvtMsg { val NAME = "PresenterUnassignedEvtMsg" }
  case class PresenterUnassignedEvtMsg(header: BbbClientMsgHeader, body: PresenterUnassignedEvtMsgBody) extends BbbCoreMsg
  case class PresenterUnassignedEvtMsgBody(intId: String, name: String, assignedBy: String)

  /** Presentation Messages */
  object SetCurrentPresentationPubMsg { val NAME = "SetCurrentPresentationPubMsg"}
  case class SetCurrentPresentationPubMsg(header: BbbClientMsgHeader, body: SetCurrentPresentationPubMsgBody) extends StandardMsg
  case class SetCurrentPresentationPubMsgBody(presentationId: String)

  object GetPresentationInfoReqMsg { val NAME = "GetPresentationInfoReqMsg"}
  case class GetPresentationInfoReqMsg(header: BbbClientMsgHeader, body: GetPresentationInfoReqMsgBody) extends StandardMsg
  case class GetPresentationInfoReqMsgBody(userId: String)

  object SetCurrentPagePubMsg { val NAME = "SetCurrentPagePubMsg"}
  case class SetCurrentPagePubMsg(header: BbbClientMsgHeader, body: SetCurrentPagePubMsgBody) extends StandardMsg
  case class SetCurrentPagePubMsgBody(presentationId: String, pageId: String)

  object ResizeAndMovePagePubMsg { val NAME = "ResizeAndMovePagePubMsg"}
  case class ResizeAndMovePagePubMsg(header: BbbClientMsgHeader, body: ResizeAndMovePagePubMsgBody) extends StandardMsg
  case class ResizeAndMovePagePubMsgBody(presentationId: String, pageId: String, xOffset: Double, yOffset: Double, widthRatio: Double, heightRatio: Double)

  object RemovePresentationPubMsg { val NAME = "RemovePresentationPubMsg"}
  case class RemovePresentationPubMsg(header: BbbClientMsgHeader, body: RemovePresentationPubMsgBody) extends StandardMsg
  case class RemovePresentationPubMsgBody(presentationId: String)

  object PreuploadedPresentationsSysPubMsg { val NAME = "PreuploadedPresentationsSysPubMsg"}
  case class PreuploadedPresentationsSysPubMsg(header: BbbClientMsgHeader, body: PreuploadedPresentationsSysPubMsgBody) extends StandardMsg
  case class PreuploadedPresentationsSysPubMsgBody(presentations: Vector[PresentationVO])

  object PresentationConversionUpdateSysPubMsg { val NAME = "PresentationConversionUpdateSysPubMsg"}
  case class PresentationConversionUpdateSysPubMsg(header: BbbClientMsgHeader,
                                                   body: PresentationConversionUpdateSysPubMsgBody) extends StandardMsg
  case class PresentationConversionUpdateSysPubMsgBody(messageKey: String,
                                                       code: String,
                                                       presentationId: String,
                                                       presName: String)

  object PresentationPageCountErrorSysPubMsg { val NAME = "PresentationPageCountErrorSysPubMsg"}
  case class PresentationPageCountErrorSysPubMsg(header: BbbClientMsgHeader,
                                                 body: PresentationPageCountErrorSysPubMsgBody) extends StandardMsg
  case class PresentationPageCountErrorSysPubMsgBody(messageKey: String, code: String, presentationId: String,
                                                     numberOfPages: Int, maxNumberPages: Int, presName: String)

  object PresentationPageGeneratedSysPubMsg { val NAME = "PresentationPageGeneratedSysPubMsg"}
  case class PresentationPageGeneratedSysPubMsg(header: BbbClientMsgHeader,
                                                body: PresentationPageGeneratedSysPubMsgBody) extends StandardMsg
  case class PresentationPageGeneratedSysPubMsgBody(messageKey: String, code: String, presentationId: String,
                                                    numberOfPages: Int, pagesCompleted: Int, presName: String)

  object PresentationConversionCompletedSysPubMsg { val NAME = "PresentationConversionCompletedSysPubMsg"}
  case class PresentationConversionCompletedSysPubMsg(header: BbbClientMsgHeader,
                                                      body: PresentationConversionCompletedSysPubMsgBody) extends StandardMsg
  case class PresentationConversionCompletedSysPubMsgBody(messageKey: String, code: String,
                                                          presentation: PresentationVO)


  /** Presentation Messages */
  object NewPresentationEvtMsg { val NAME = "NewPresentationEvtMsg"}
  case class NewPresentationEvtMsg(header: BbbClientMsgHeader, body: NewPresentationEvtMsgBody) extends BbbCoreMsg
  case class NewPresentationEvtMsgBody(presentation: PresentationVO)

  object SetCurrentPresentationEvtMsg { val NAME = "SetCurrentPresentationEvtMsg"}
  case class SetCurrentPresentationEvtMsg(header: BbbClientMsgHeader, body: SetCurrentPresentationEvtMsgBody) extends BbbCoreMsg
  case class SetCurrentPresentationEvtMsgBody(presentationId: String)

  object GetPresentationInfoRespMsg { val NAME = "GetPresentationInfoRespMsg"}
  case class GetPresentationInfoRespMsg(header: BbbClientMsgHeader, body: GetPresentationInfoRespMsgBody) extends BbbCoreMsg
  case class GetPresentationInfoRespMsgBody(presentations: Vector[PresentationVO])

  object SyncGetPresentationInfoRespMsg { val NAME = "SyncGetPresentationInfoRespMsg"}
  case class SyncGetPresentationInfoRespMsg(header: BbbClientMsgHeader, body: SyncGetPresentationInfoRespMsgBody) extends BbbCoreMsg
  case class SyncGetPresentationInfoRespMsgBody(presentations: Vector[PresentationVO])

  object SetCurrentPageEvtMsg { val NAME = "SetCurrentPageEvtMsg"}
  case class SetCurrentPageEvtMsg(header: BbbClientMsgHeader, body: SetCurrentPageEvtMsgBody) extends BbbCoreMsg
  case class SetCurrentPageEvtMsgBody(presentationId: String, pageId: String)

  object ResizeAndMovePageEvtMsg { val NAME = "ResizeAndMovePageEvtMsg"}
  case class ResizeAndMovePageEvtMsg(header: BbbClientMsgHeader, body: ResizeAndMovePageEvtMsgBody) extends BbbCoreMsg
  case class ResizeAndMovePageEvtMsgBody(presentationId: String, pageId: String, xOffset: Double, yOffset: Double, widthRatio: Double, heightRatio: Double)

  object RemovePresentationEvtMsg { val NAME = "RemovePresentationEvtMsg"}
  case class RemovePresentationEvtMsg(header: BbbClientMsgHeader, body: RemovePresentationEvtMsgBody) extends BbbCoreMsg
  case class RemovePresentationEvtMsgBody(presentationId: String)

  object PresentationConversionUpdateEvtMsg { val NAME = "PresentationConversionUpdateEvtMsg"}
  case class PresentationConversionUpdateEvtMsg(header: BbbClientMsgHeader, body: PresentationConversionUpdateEvtMsgBody) extends BbbCoreMsg
  case class PresentationConversionUpdateEvtMsgBody(messageKey: String, code: String, presentationId: String, presName: String)

  object PresentationPageCountErrorEvtMsg { val NAME = "PresentationPageCountErrorEvtMsg"}
  case class PresentationPageCountErrorEvtMsg(header: BbbClientMsgHeader, body: PresentationPageCountErrorEvtMsgBody) extends BbbCoreMsg
  case class PresentationPageCountErrorEvtMsgBody(messageKey: String, code: String, presentationId: String, numberOfPages: Int, maxNumberPages: Int, presName: String)

  object PresentationPageGeneratedEvtMsg { val NAME = "PresentationPageGeneratedEvtMsg"}
  case class PresentationPageGeneratedEvtMsg(header: BbbClientMsgHeader, body: PresentationPageGeneratedEvtMsgBody) extends BbbCoreMsg
  case class PresentationPageGeneratedEvtMsgBody(messageKey: String, code: String, presentationId: String, numberOfPages: Int, pagesCompleted: Int, presName: String)

  object PresentationConversionCompletedEvtMsg { val NAME = "PresentationConversionCompletedEvtMsg"}
  case class PresentationConversionCompletedEvtMsg(header: BbbClientMsgHeader, body: PresentationConversionCompletedEvtMsgBody) extends BbbCoreMsg
  case class PresentationConversionCompletedEvtMsgBody(messageKey: String, code: String, presentation: PresentationVO)


