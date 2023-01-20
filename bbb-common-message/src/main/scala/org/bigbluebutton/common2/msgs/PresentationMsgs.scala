package org.bigbluebutton.common2.msgs

import org.bigbluebutton.common2.domain.PresentationVO

// ------------ client to akka-apps ------------
// ------------ client to akka-apps ------------

// ------------ bbb-common-web to akka-apps ------------
object PreuploadedPresentationsSysPubMsg { val NAME = "PreuploadedPresentationsSysPubMsg" }
case class PreuploadedPresentationsSysPubMsg(header: BbbClientMsgHeader, body: PreuploadedPresentationsSysPubMsgBody) extends StandardMsg
case class PreuploadedPresentationsSysPubMsgBody(presentations: Vector[PresentationVO])

object MakePresentationWithAnnotationDownloadReqMsg { val NAME = "MakePresentationWithAnnotationDownloadReqMsg" }
case class MakePresentationWithAnnotationDownloadReqMsg(header: BbbClientMsgHeader, body: MakePresentationWithAnnotationDownloadReqMsgBody) extends StandardMsg
case class MakePresentationWithAnnotationDownloadReqMsgBody(presId: String, allPages: Boolean, pages: List[Int])

object NewPresAnnFileAvailableMsg { val NAME = "NewPresAnnFileAvailableMsg" }
case class NewPresAnnFileAvailableMsg(header: BbbClientMsgHeader, body: NewPresAnnFileAvailableMsgBody) extends StandardMsg
case class NewPresAnnFileAvailableMsgBody(fileURI: String, presId: String)

object PresAnnStatusMsg { val NAME = "PresAnnStatusMsg" }
case class PresAnnStatusMsg(header: BbbClientMsgHeader, body: PresAnnStatusMsgBody) extends StandardMsg
case class PresAnnStatusMsgBody(presId: String, pageNumber: Int, totalPages: Int, status: String, error: Boolean);

// ------------ bbb-common-web to akka-apps ------------

// ------------ akka-apps to client ------------
object PresenterAssignedEvtMsg { val NAME = "PresenterAssignedEvtMsg" }
case class PresenterAssignedEvtMsg(header: BbbClientMsgHeader, body: PresenterAssignedEvtMsgBody) extends BbbCoreMsg
case class PresenterAssignedEvtMsgBody(presenterId: String, presenterName: String, assignedBy: String)

object PresenterUnassignedEvtMsg { val NAME = "PresenterUnassignedEvtMsg" }
case class PresenterUnassignedEvtMsg(header: BbbClientMsgHeader, body: PresenterUnassignedEvtMsgBody) extends BbbCoreMsg
case class PresenterUnassignedEvtMsgBody(intId: String, name: String, assignedBy: String)

object NewPresentationEvtMsg { val NAME = "NewPresentationEvtMsg" }
case class NewPresentationEvtMsg(header: BbbClientMsgHeader, body: NewPresentationEvtMsgBody) extends BbbCoreMsg
case class NewPresentationEvtMsgBody(presentation: PresentationVO)

object NewPresAnnFileAvailableEvtMsg { val NAME = "NewPresAnnFileAvailableEvtMsg" }
case class NewPresAnnFileAvailableEvtMsg(header: BbbClientMsgHeader, body: NewPresAnnFileAvailableEvtMsgBody) extends BbbCoreMsg
case class NewPresAnnFileAvailableEvtMsgBody(fileURI: String, presId: String)

object PresAnnStatusEvtMsg { val NAME = "PresAnnStatusEvtMsg" }
case class PresAnnStatusEvtMsg(header: BbbClientMsgHeader, body: PresAnnStatusEvtMsgBody) extends BbbCoreMsg
case class PresAnnStatusEvtMsgBody(presId: String, pageNumber: Int, totalPages: Int, status: String, error: Boolean);

object CaptureSharedNotesReqEvtMsg { val NAME = "CaptureSharedNotesReqEvtMsg" }
case class CaptureSharedNotesReqEvtMsg(header: BbbClientMsgHeader, body: CaptureSharedNotesReqEvtMsgBody) extends BbbCoreMsg
case class CaptureSharedNotesReqEvtMsgBody(breakoutId: String, filename: String)

// ------------ akka-apps to client ------------
