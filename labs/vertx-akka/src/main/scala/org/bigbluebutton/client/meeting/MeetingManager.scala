package org.bigbluebutton.client.meeting

object MeetingManager {
  def findWithMeetingId(manager: MeetingManager, meetingId: String): Option[Meeting] = {
    manager.toVector.find(m => m.meetingId == meetingId)
  }

  def remove(manager: MeetingManager, meetingId: String): Option[Meeting] = {
    manager.remove(meetingId)
  }

  def add(manager: MeetingManager, meeting: Meeting): Meeting = {
    manager.save(meeting)
  }

}

class MeetingManager {
  private var meetings = new collection.immutable.HashMap[String, Meeting]

  private def toVector: Vector[Meeting] = meetings.values.toVector

  private def save(meeting: Meeting): Meeting = {
    meetings += meeting.meetingId -> meeting
    meeting
  }

  private def remove(id: String): Option[Meeting] = {
    val meeting = meetings.get(id)
    meeting foreach (u => meetings -= id)
    meeting
  }
}
