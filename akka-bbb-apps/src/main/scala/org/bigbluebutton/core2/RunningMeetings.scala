package org.bigbluebutton.core2

import org.bigbluebutton.core.db.MeetingDAO
import org.bigbluebutton.core.running.RunningMeeting

import scala.collection.immutable.VectorMap
import scala.collection.immutable.SortedSet

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

  def getVoiceBridge(meetings: RunningMeetings, length: Int): Option[String] = {
    def prependZeros(number: Int, length: Int): String = {
      String.format(s"%0${length}d", number.asInstanceOf[Object])
    }

    val voiceBridge = meetings.getVoiceBridge()
    if (voiceBridge == -1) {
      None
    } else if (voiceBridge >= Math.pow(10, length)) {
      meetings.addVoiceBridge(voiceBridge)
      None
    } else {
      Some(prependZeros(voiceBridge, length))
    }
  }

  def isVoiceBridgeInUse(meetings: RunningMeetings, voiceBridge: String): Boolean = {
    meetings.isVoiceBridgeInUse(voiceBridge)
  }
}

class RunningMeetings {
  private var meetings: VectorMap[String, RunningMeeting] = VectorMap.empty

  private var availableVoiceBridges: SortedSet[Int] = SortedSet((1 to 99999): _*)

  private def toVector: Vector[RunningMeeting] = meetings.values.toVector

  private def getMeetings: VectorMap[String, RunningMeeting] = meetings

  private def save(meeting: RunningMeeting): RunningMeeting = {
    meetings += meeting.props.meetingProp.intId -> meeting
    meeting
  }

  private def remove(id: String): Option[RunningMeeting] = {
    val meeting = meetings.get(id)
    meeting foreach (u => meetings -= id)
    meeting foreach (m => availableVoiceBridges += m.props.voiceProp.voiceConf.toInt)
    meeting
  }

  private def getVoiceBridge(): Int = {
    availableVoiceBridges.size match {
      case 0 => -1
      case _: Int =>
        val voiceBridge = availableVoiceBridges.head
        availableVoiceBridges -= voiceBridge
        voiceBridge
    }
  }

  private def addVoiceBridge(voiceBridge: Int): Unit = {
    availableVoiceBridges += voiceBridge
  }

  private def isVoiceBridgeInUse(voiceBridge: String): Boolean = {
    val opt = voiceBridge.toIntOption
    opt match {
      case Some(v) => !availableVoiceBridges.contains(v)
      case None    => false
    }
  }
}
