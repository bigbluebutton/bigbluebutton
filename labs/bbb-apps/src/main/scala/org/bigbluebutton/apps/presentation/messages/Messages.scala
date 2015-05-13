package org.bigbluebutton.apps.presentation.messages

import org.bigbluebutton.apps.Session
import org.bigbluebutton.apps.users.data.UserIdAndName
import org.bigbluebutton.apps.presentation.data._

case class ClearPresentation(session: Session,
  presentation: PresentationIdAndName,
  clearedBy: UserIdAndName)

case class PresentationCleared(session: Session,
  presentation: PresentationIdAndName,
  clearedBy: UserIdAndName)

case class RemovePresentation(session: Session,
  presentation: PresentationIdAndName,
  removedBy: UserIdAndName)

case class PresentationRemoved(session: Session,
  presentation: PresentationIdAndName,
  removedBy: UserIdAndName)

case class SendCursorUpdate(session: Session,
  xPercent: Double, yPercent: Double)
case class UpdateCursorPosition(session: Session,
  xPercent: Double, yPercent: Double)

case class ResizeAndMovePage(session: Session,
  presentation: PresentationIdAndName,
  page: Int,
  position: Position)
case class PageMoved(session: Session,
  presentation: PresentationIdAndName,
  page: Page)

case class DisplayPage(session: Session,
  presentation: PresentationIdAndName,
  page: Int)

case class PageDisplayed(session: Session,
  presentation: PresentationIdAndName,
  page: Page)

case class SharePresentation(session: Session,
  presentation: PresentationIdAndName)

case class PresentationShared(session: Session, presentation: Presentation)

case class PreuploadedPresentations(session: Session,
  presentations: Seq[Presentation])

case class PresentationConverted(session: Session,
  presentation: Presentation)

case class PresentationConversionUpdate(meetingID: String, msg: Map[String, Object])
case class GetPresentationInfo(meetingID: String, requesterID: String)
case class GetSlideInfo(meetingID: String, requesterID: String)
