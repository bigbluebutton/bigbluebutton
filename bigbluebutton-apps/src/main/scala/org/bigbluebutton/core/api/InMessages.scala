package org.bigbluebutton.core.api

import org.bigbluebutton.core.api.Role._
import java.util.Map

trait InMessage {val meetingID: String}

case class KeepAliveMessage(aliveID:String)

case class CreateMeeting(meetingID: String, recorded: Boolean, voiceBridge: String) extends InMessage
case class InitializeMeeting(meetingID: String, recorded: Boolean) extends InMessage
case class DestroyMeeting(meetingID: String) extends InMessage
case class StartMeeting(meetingID: String) extends InMessage
case class EndMeeting(meetingID: String) extends InMessage

// Users
case class UserJoining(meetingID: String, userID: String, name: String, role: Role, extUserID: String) extends InMessage
case class UserLeaving(meetingID: String, userID: String) extends InMessage
case class GetUsers(meetingID: String, requesterID: String) extends InMessage
case class ChangeUserStatus(meetingID: String, userID: String, status: String, value: Object) extends InMessage
case class AssignPresenter(meetingID: String, newPresenterID: String, newPresenterName: String, assignedBy: String) extends InMessage

// Presentation
case class ClearPresentation(meetingID: String) extends InMessage
case class PresentationConversionUpdate(meetingID: String, msg: Map[String, Object]) extends InMessage
case class RemovePresentation(meetingID: String, presentationID: String) extends InMessage
case class GetPresentationInfo(meetingID: String, requesterID: String) extends InMessage
case class SendCursorUpdate(meetingID: String, xPercent: Double, yPercent: Double) extends InMessage
case class ResizeAndMoveSlide(meetingID: String, xOffset: Double, yOffset: Double, widthRatio: Double, heightRatio: Double) extends InMessage
case class GotoSlide(meetingID: String, slide: Int) extends InMessage
case class SharePresentation(meetingID: String, presentationID: String, share: Boolean) extends InMessage
case class GetSlideInfo(meetingID: String, requesterID: String) extends InMessage
case class PreuploadedPresentations(meetingID: String, presentations: Array[Object]) extends InMessage

