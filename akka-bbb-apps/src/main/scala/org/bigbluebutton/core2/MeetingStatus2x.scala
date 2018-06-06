package org.bigbluebutton.core2

import java.util.concurrent.TimeUnit

case class Permissions(
  disableCam:             Boolean = false,
  disableMic:             Boolean = false,
  disablePrivChat:        Boolean = false,
  disablePubChat:         Boolean = false,
  lockedLayout:           Boolean = false,
  lockOnJoin:             Boolean = true,
  lockOnJoinConfigurable: Boolean = false
)

case class MeetingExtensionProp(maxExtensions: Int = 2, numExtensions: Int = 0, extendByMinutes: Int = 20,
                                sendNotice: Boolean = true, sent15MinNotice: Boolean = false,
                                sent10MinNotice: Boolean = false, sent5MinNotice: Boolean = false)

object MeetingStatus2x {

  def isVoiceRecording(status: MeetingStatus2x): Boolean = {
    status.voiceRecordings.values.find(s => s.recording) match {
      case Some(rec) => true
      case None      => false
    }
  }

  def isExtensionAllowed(status: MeetingStatus2x): Boolean = status.extension.numExtensions < status.extension.maxExtensions
  def incNumExtension(status: MeetingStatus2x): Int = {
    if (status.extension.numExtensions < status.extension.maxExtensions) {
      status.extension = status.extension.copy(numExtensions = status.extension.numExtensions + 1); status.extension.numExtensions
    }
    status.extension.numExtensions
  }

  def notice15MinutesSent(status: MeetingStatus2x) = status.extension = status.extension.copy(sent15MinNotice = true)
  def notice10MinutesSent(status: MeetingStatus2x) = status.extension = status.extension.copy(sent10MinNotice = true)
  def notice5MinutesSent(status: MeetingStatus2x) = status.extension = status.extension.copy(sent5MinNotice = true)

  def getMeetingExtensionProp(status: MeetingStatus2x): MeetingExtensionProp = status.extension
  def muteMeeting(status: MeetingStatus2x) = status.meetingMuted = true
  def unmuteMeeting(status: MeetingStatus2x) = status.meetingMuted = false
  def isMeetingMuted(status: MeetingStatus2x): Boolean = status.meetingMuted
  def recordingStarted(status: MeetingStatus2x) = status.recording = true
  def recordingStopped(status: MeetingStatus2x) = status.recording = false
  def isRecording(status: MeetingStatus2x): Boolean = status.recording

  def voiceRecordingStart(status2x: MeetingStatus2x, stream: String): VoiceRecordingStream = {
    val vrs = new VoiceRecordingStream(stream, recording = false, createdOn = System.currentTimeMillis, ackedOn = None, stoppedOn = None)
    status2x.voiceRecordings += vrs.stream -> vrs
    vrs
  }

  def voiceRecordingStarted(status2x: MeetingStatus2x, stream: String): Option[VoiceRecordingStream] = {
    val vrs = for {
      recStream <- status2x.voiceRecordings.values find (s => s.stream == stream)
    } yield {
      val rs = recStream.copy(recording = true, ackedOn = Some(System.currentTimeMillis))
      status2x.voiceRecordings += rs.stream -> rs
      rs
    }

    vrs
  }

  def voiceRecordingStopped(status2x: MeetingStatus2x, stream: String): Option[VoiceRecordingStream] = {
    val vrs = for {
      recStream <- status2x.voiceRecordings.values find (s => s.stream == stream)
    } yield {
      val rs = recStream.copy(recording = false, stoppedOn = Some(System.currentTimeMillis))
      status2x.voiceRecordings += rs.stream -> rs
      rs
    }

    vrs
  }

  def getVoiceRecordingStreams(status2x: MeetingStatus2x): Vector[VoiceRecordingStream] = {
    status2x.voiceRecordings.values.filter(s => s.recording).toVector
  }

  def setWebcamsOnlyForModerator(status: MeetingStatus2x, value: Boolean) = status.webcamsOnlyForModerator = value
  def webcamsOnlyForModeratorEnabled(status: MeetingStatus2x): Boolean = status.webcamsOnlyForModerator
  def permisionsInitialized(status: MeetingStatus2x): Boolean = status.permissionsInited
  def initializePermissions(status: MeetingStatus2x) = status.permissionsInited = true
  def audioSettingsInitialized(status: MeetingStatus2x): Boolean = status.audioSettingsInited
  def initializeAudioSettings(status: MeetingStatus2x) = status.audioSettingsInited = true
  def permissionsEqual(status: MeetingStatus2x, other: Permissions): Boolean = status.permissions == other
  def getPermissions(status: MeetingStatus2x): Permissions = status.permissions
  def setPermissions(status: MeetingStatus2x, p: Permissions) = {
    status.permissions = p
    status.permissionsChangedOn = System.currentTimeMillis()
  }
  def getPermissionsChangedOn(status: MeetingStatus2x): Long = status.permissionsChangedOn
  def meetingHasEnded(status: MeetingStatus2x) = status.meetingEnded = true
  def hasMeetingEnded(status: MeetingStatus2x): Boolean = status.meetingEnded
  def timeNowInMinutes(status: MeetingStatus2x): Long = TimeUnit.NANOSECONDS.toMinutes(System.nanoTime())
  def timeNowInSeconds(status: MeetingStatus2x): Long = TimeUnit.NANOSECONDS.toSeconds(System.nanoTime())

}

class MeetingStatus2x {
  private var voiceRecordings: collection.immutable.HashMap[String, VoiceRecordingStream] = new collection.immutable.HashMap[String, VoiceRecordingStream]

  private var audioSettingsInited = false
  private var permissionsInited = false
  private var permissionsChangedOn: Long = System.currentTimeMillis()
  private var permissions = new Permissions()
  private var recording = false

  private var meetingEnded = false
  private var meetingMuted = false

  private var extension = new MeetingExtensionProp

  private var webcamsOnlyForModerator = false

}

case class VoiceRecordingStream(stream: String, recording: Boolean, createdOn: Long, ackedOn: Option[Long], stoppedOn: Option[Long])
