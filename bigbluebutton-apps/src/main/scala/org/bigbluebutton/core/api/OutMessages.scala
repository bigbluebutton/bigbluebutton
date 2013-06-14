package org.bigbluebutton.core.api

abstract class OutMessage
case class MeetingCreated(meetingID: String, recorded: Boolean) extends IOutMessage
case class MeetingDestroyed(meetingID: String) extends IOutMessage

case class UserLeft(meetingID: String, isRecorded: Boolean, userID: String) extends IOutMessage
case class PresenterAssigned(meetingID: String, recorded: Boolean, presenter: Presenter) extends IOutMessage

// Value Objects
case class MeetingVO(id: String, recorded: Boolean)

