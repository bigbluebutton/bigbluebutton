package org.bigbluebutton.common2.msgs

import org.bigbluebutton.common2.domain.PresentationVO


// ------------ client to akka-apps ------------
object SetCurrentPresentationPubMsg { val NAME = "SetCurrentPresentationPubMsg"}
case class SetCurrentPresentationPubMsg(header: BbbClientMsgHeader, body: SetCurrentPresentationPubMsgBody) extends StandardMsg
case class SetCurrentPresentationPubMsgBody(presentationId: String)

object SetCurrentPagePubMsg { val NAME = "SetCurrentPagePubMsg"}
case class SetCurrentPagePubMsg(header: BbbClientMsgHeader, body: SetCurrentPagePubMsgBody) extends StandardMsg
case class SetCurrentPagePubMsgBody(presentationId: String, pageId: String)

object ResizeAndMovePagePubMsg { val NAME = "ResizeAndMovePagePubMsg"}
case class ResizeAndMovePagePubMsg(header: BbbClientMsgHeader, body: ResizeAndMovePagePubMsgBody) extends StandardMsg
case class ResizeAndMovePagePubMsgBody(presentationId: String, pageId: String, xOffset: Double, yOffset: Double, widthRatio: Double, heightRatio: Double)

object RemovePresentationPubMsg { val NAME = "RemovePresentationPubMsg"}
case class RemovePresentationPubMsg(header: BbbClientMsgHeader, body: RemovePresentationPubMsgBody) extends StandardMsg
case class RemovePresentationPubMsgBody(presentationId: String)
// ------------ client to akka-apps ------------


// ------------ bbb-common-web to akka-apps ------------
object PreuploadedPresentationsSysPubMsg { val NAME = "PreuploadedPresentationsSysPubMsg"}
case class PreuploadedPresentationsSysPubMsg(header: BbbClientMsgHeader, body: PreuploadedPresentationsSysPubMsgBody) extends StandardMsg
case class PreuploadedPresentationsSysPubMsgBody(presentations: Vector[PresentationVO])
// ------------ bbb-common-web to akka-apps ------------


// ------------ akka-apps to client ------------
object PresenterAssignedEvtMsg { val NAME = "PresenterAssignedEvtMsg" }
case class PresenterAssignedEvtMsg(header: BbbClientMsgHeader, body: PresenterAssignedEvtMsgBody) extends BbbCoreMsg
case class PresenterAssignedEvtMsgBody(presenterId: String, presenterName: String, assignedBy: String)

object PresenterUnassignedEvtMsg { val NAME = "PresenterUnassignedEvtMsg" }
case class PresenterUnassignedEvtMsg(header: BbbClientMsgHeader, body: PresenterUnassignedEvtMsgBody) extends BbbCoreMsg
case class PresenterUnassignedEvtMsgBody(intId: String, name: String, assignedBy: String)

object NewPresentationEvtMsg { val NAME = "NewPresentationEvtMsg"}
case class NewPresentationEvtMsg(header: BbbClientMsgHeader, body: NewPresentationEvtMsgBody) extends BbbCoreMsg
case class NewPresentationEvtMsgBody(presentation: PresentationVO)

object SetCurrentPresentationEvtMsg { val NAME = "SetCurrentPresentationEvtMsg"}
case class SetCurrentPresentationEvtMsg(header: BbbClientMsgHeader, body: SetCurrentPresentationEvtMsgBody) extends BbbCoreMsg
case class SetCurrentPresentationEvtMsgBody(presentationId: String)

object SetCurrentPageEvtMsg { val NAME = "SetCurrentPageEvtMsg"}
case class SetCurrentPageEvtMsg(header: BbbClientMsgHeader, body: SetCurrentPageEvtMsgBody) extends BbbCoreMsg
case class SetCurrentPageEvtMsgBody(presentationId: String, pageId: String)

object ResizeAndMovePageEvtMsg { val NAME = "ResizeAndMovePageEvtMsg"}
case class ResizeAndMovePageEvtMsg(header: BbbClientMsgHeader, body: ResizeAndMovePageEvtMsgBody) extends BbbCoreMsg
case class ResizeAndMovePageEvtMsgBody(presentationId: String, pageId: String, xOffset: Double, yOffset: Double, widthRatio: Double, heightRatio: Double)

object RemovePresentationEvtMsg { val NAME = "RemovePresentationEvtMsg"}
case class RemovePresentationEvtMsg(header: BbbClientMsgHeader, body: RemovePresentationEvtMsgBody) extends BbbCoreMsg
case class RemovePresentationEvtMsgBody(presentationId: String)


// html5 client only
object SyncGetPresentationInfoRespMsg { val NAME = "SyncGetPresentationInfoRespMsg"}
case class SyncGetPresentationInfoRespMsg(header: BbbClientMsgHeader, body: SyncGetPresentationInfoRespMsgBody) extends BbbCoreMsg
case class SyncGetPresentationInfoRespMsgBody(presentations: Vector[PresentationVO])
// ------------ akka-apps to client ------------


