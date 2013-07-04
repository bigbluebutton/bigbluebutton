package org.bigbluebutton.core.api

abstract class OutMessage
case class MeetingCreated(meetingID: String) extends IOutMessage
case class MeetingEnded(meetingID: String) extends IOutMessage
case class MeetingDestroyed(meetingID: String) extends IOutMessage
case class KeepAliveMessageReply(aliveID:String) extends IOutMessage
case object IsAliveMessage extends IOutMessage

case class UserLeft(meetingID: String, isRecorded: Boolean, userID: String) extends IOutMessage
case class PresenterAssigned(meetingID: String, recorded: Boolean, presenter: Presenter) extends IOutMessage

// Presentation
case class ClearPresentationOutMsg(meetingID: String, recorded: Boolean) extends IOutMessage
case class PresentationConversionUpdateOutMsg(meetingID: String, recorded: Boolean, msg: java.util.Map[String, Object]) extends IOutMessage
case class RemovePresentationOutMsg(meetingID: String, recorded: Boolean, presentationID: String) extends IOutMessage
case class GetPresentationInfoOutMsg(meetingID: String, recorded: Boolean, requesterID: String, info: java.util.Map[String, Object] ) extends IOutMessage
case class SendCursorUpdateOutMsg(meetingID: String, recorded: Boolean, xPercent: Double, yPercent: Double) extends IOutMessage
case class ResizeAndMoveSlideOutMsg(meetingID: String, recorded: Boolean, xOffset: Double, yOffset: Double, widthRatio: Double, heightRatio: Double) extends IOutMessage
case class GotoSlideOutMsg(meetingID: String, recorded: Boolean, slide: Int) extends IOutMessage
case class SharePresentationOutMsg(meetingID: String, recorded: Boolean, presentationID: String, share: Boolean) extends IOutMessage
case class GetSlideInfoOutMsg(meetingID: String, recorded: Boolean, requesterID: String, xOffset: Double, yOffset: Double, widthRatio: Double, heightRatio: Double) extends IOutMessage
case class GetPreuploadedPresentationsOutMsg(meetingID:String, recorded: Boolean) extends IOutMessage

// Value Objects
case class MeetingVO(id: String, recorded: Boolean)

