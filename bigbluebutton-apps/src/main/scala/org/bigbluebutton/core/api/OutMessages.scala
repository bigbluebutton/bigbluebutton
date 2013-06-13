package org.bigbluebutton.core.api

abstract class OutMessage
case class MeetingStarted() extends OutMessage
case class MeetingEnded() extends OutMessage

case class UserLeft(meetingID: String, isRecorded: Boolean, userID: String) extends OutMessage
case class PresenterAssigned(meetingID: String, isRecorded: Boolean, presenter: Presenter) extends OutMessage

// Value Objects
case class MeetingVO(id: String, recorded: Boolean)

