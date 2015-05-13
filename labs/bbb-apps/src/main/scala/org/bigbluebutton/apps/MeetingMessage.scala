package org.bigbluebutton.apps

case class CreateMeeting(descriptor: MeetingDescriptor)
case class CreateMeetingResponse(success: Boolean,
  descriptor: MeetingDescriptor,
  message: String,
  session: Session)

case class MeetingCreated(session: Session, meeting: MeetingDescriptor)
