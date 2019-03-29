package org.bigbluebutton.api2.meeting

import org.bigbluebutton.common2.domain.DefaultProps

object MeetingsManager {

  def create(mgr: MeetingsManager, defaultProps: DefaultProps): RunningMeeting = {
    val rm = RunningMeeting(defaultProps.meetingProp.intId, defaultProps)
    mgr.save(rm)
    rm
  }

  def findWithId(mgr: MeetingsManager, id: String): Option[RunningMeeting] = {
    mgr.toVector.find(m => m.meetingId == id)
  }

  def findMeetingThatStartsWith(mgr: MeetingsManager, id: String): Option[RunningMeeting] = {
    mgr.toVector.find(m => m.meetingId.startsWith(id))
  }

  def add(mgr: MeetingsManager, meeting: RunningMeeting): RunningMeeting = {
    mgr.save(meeting)
  }

  def remove(mgr: MeetingsManager, id: String): Option[RunningMeeting] = {
    mgr.remove(id)
  }
}

class MeetingsManager {
  private var meetings = new collection.immutable.HashMap[String, RunningMeeting]

  private def toVector: Vector[RunningMeeting] = meetings.values.toVector

  private def save(meeting: RunningMeeting): RunningMeeting = {
    meetings += meeting.meetingId -> meeting
    meeting
  }

  private def remove(id: String): Option[RunningMeeting] = {
    val meeting = meetings.get(id)
    meeting foreach (u => meetings -= id)
    meeting
  }
}
