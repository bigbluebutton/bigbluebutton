package org.bigbluebutton.core2

import org.bigbluebutton.core.db.MeetingDAO
import org.bigbluebutton.core.running.RunningMeeting

import scala.collection.immutable.VectorMap

object RunningMeetings {
  def findWithId(meetings: RunningMeetings, id: String): Option[RunningMeeting] = {
    meetings.toVector.find(m => m.props.meetingProp.intId == id)
  }

  def findWithExtId(meetings: RunningMeetings, id: String): Option[RunningMeeting] = {
    meetings.toVector.find(m => m.props.meetingProp.extId == id)
  }

  def add(meetings: RunningMeetings, meeting: RunningMeeting): RunningMeeting = {
    meetings.save(meeting)
    meeting
  }

  def remove(meetings: RunningMeetings, id: String): Option[RunningMeeting] = {
    meetings.remove(id)
  }

  def numMeetings(meetings: RunningMeetings): Int = {
    meetings.toVector.length
  }

  def meetings(meetings: RunningMeetings): Vector[RunningMeeting] = {
    meetings.toVector
  }

  def meetingsMap(meetings: RunningMeetings): VectorMap[String, RunningMeeting] = {
    meetings.getMeetings
  }

  def findMeetingWithVoiceConfId(meetings: RunningMeetings, voiceConfId: String): Option[RunningMeeting] = {
    meetings.toVector.find(m => { m.props.voiceProp.voiceConf == voiceConfId })
  }

}

class RunningMeetings {
  private var meetings: VectorMap[String, RunningMeeting] = VectorMap.empty

  private def toVector: Vector[RunningMeeting] = meetings.values.toVector

  private def getMeetings: VectorMap[String, RunningMeeting] = meetings

  private def save(meeting: RunningMeeting): RunningMeeting = {
    meetings += meeting.props.meetingProp.intId -> meeting
    meeting
  }

  private def remove(id: String): Option[RunningMeeting] = {
    val meeting = meetings.get(id)
    meeting foreach (u => meetings -= id)
    meeting
  }
}
