package org.bigbluebutton.common2.messages


import org.bigbluebutton.common2.domain._

object MessageBody {

  case class UserEmojiStatusChangeReqMsgBody(userId: String, emoji: String)
  case class EjectUserFromMeetingReqMsgBody(userId: String, requesterId: String)


  case class ChangeUserStatusReqMsgBody(userId: String, status: String, value: String)
  case class ChangeUserRoleReqMsgBody(userId: String, role: String)
  case class AssignPresenterReqMsgBody(userId: String, requesterId: String)
  case class SetRecordingReqMsgBody(recording: Boolean, requesterId: String)
  case class GetRecordingStatusReqMsgBody(requesterId: String)
  case class AllowUserToShareDesktopReqMsgBody(userId: String)

  // Presentation Message Bodies
  case class SetCurrentPresentationPubMsgBody(presentationId: String)
  case class SetCurrentPagePubMsgBody(presentationId: String, pageId: String)
  case class ResizeAndMovePagePubMsgBody(presentationId: String, pageId: String, xOffset: Double, yOffset: Double, widthRatio: Double, heightRatio: Double)
  case class RemovePresentationPubMsgBody(presentationId: String)
  case class PreuploadedPresentationsPubMsgBody(presentations: Vector[PresentationVO])
  case class PresentationConversionUpdatePubMsgBody(messageKey: String, code: String, presentationId: String, presName: String)
  case class PresentationPageCountErrorPubMsgBody(messageKey: String, code: String, presentationId: String, numberOfPages: Int, maxNumberPages: Int, presName: String)
  case class PresentationPageGeneratedPubMsgBody(messageKey: String, code: String, presentationId: String, numberOfPages: Int, pagesCompleted: Int, presName: String)
  case class PresentationConversionCompletedPubMsgBody(messageKey: String, code: String, presentation: PresentationVO)
  
  //
  /** Event messages sent by Akka apps as result of receiving incoming messages ***/
  //

  ///////////////////////////////////////////
  // Out Message Bodies
  ///////////////////////////////////////////

  // Presentation Message Bodies
  case class NewPresentationEvtMsgBody(presentation: PresentationVO)
  case class SetCurrentPresentationEvtMsgBody(presentationId: String)
  case class GetPresentationInfoRespMsgBody(presentations: Vector[PresentationVO])
  case class SetCurrentPageEvtMsgBody(presentationId: String, pageId: String)
  case class ResizeAndMovePageEvtMsgBody(presentationId: String, pageId: String, xOffset: Double, yOffset: Double, widthRatio: Double, heightRatio: Double)
  case class RemovePresentationEvtMsgBody(presentationId: String)
  case class PresentationConversionUpdateEvtMsgBody(messageKey: String, code: String, presentationId: String, presName: String)
  case class PresentationPageCountErrorEvtMsgBody(messageKey: String, code: String, presentationId: String, numberOfPages: Int, maxNumberPages: Int, presName: String)
  case class PresentationPageGeneratedEvtMsgBody(messageKey: String, code: String, presentationId: String, numberOfPages: Int, pagesCompleted: Int, presName: String)
  case class PresentationConversionCompletedEvtMsgBody(messageKey: String, code: String, presentation: PresentationVO)
  
}
