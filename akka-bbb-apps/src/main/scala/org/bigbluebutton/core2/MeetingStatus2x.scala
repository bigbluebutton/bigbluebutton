package org.bigbluebutton.core2

import java.util.concurrent.TimeUnit

import org.bigbluebutton.core.MeetingExtensionProp
import org.bigbluebutton.core.api.{ Permissions, Presenter }

object MeetingStatus2x {
  def startRecordingVoice(status: MeetingStatus2x): Boolean = {
    status.recordingVoice = true
    status.recordingVoice
  }

  def stopRecordingVoice(status: MeetingStatus2x): Boolean = {
    status.recordingVoice = false
    status.recordingVoice
  }

  def isVoiceRecording(status: MeetingStatus2x): Boolean = {
    status.recordingVoice
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
  def setVoiceRecordingFilename(status: MeetingStatus2x, path: String) = status.voiceRecordingFilename = path
  def getVoiceRecordingFilename(status: MeetingStatus2x): String = status.voiceRecordingFilename
  def setWebcamsOnlyForModerator(status: MeetingStatus2x, value: Boolean) = status.webcamsOnlyForModerator = value
  def webcamsOnlyForModeratorEnabled(status: MeetingStatus2x): Boolean = status.webcamsOnlyForModerator
  def permisionsInitialized(status: MeetingStatus2x): Boolean = status.permissionsInited
  def initializePermissions(status: MeetingStatus2x) = status.permissionsInited = true
  def audioSettingsInitialized(status: MeetingStatus2x): Boolean = status.audioSettingsInited
  def initializeAudioSettings(status: MeetingStatus2x) = status.audioSettingsInited = true
  def permissionsEqual(status: MeetingStatus2x, other: Permissions): Boolean = status.permissions == other
  def getPermissions(status: MeetingStatus2x): Permissions = status.permissions
  def setPermissions(status: MeetingStatus2x, p: Permissions) = status.permissions = p
  def meetingHasEnded(status: MeetingStatus2x) = status.meetingEnded = true
  def hasMeetingEnded(status: MeetingStatus2x): Boolean = status.meetingEnded
  def timeNowInMinutes(status: MeetingStatus2x): Long = TimeUnit.NANOSECONDS.toMinutes(System.nanoTime())
  def timeNowInSeconds(status: MeetingStatus2x): Long = TimeUnit.NANOSECONDS.toSeconds(System.nanoTime())

}

class MeetingStatus2x {

  private var recordingVoice = false
  private var audioSettingsInited = false
  private var permissionsInited = false
  private var permissions = new Permissions()
  private var recording = false

  private var muted = false
  private var meetingEnded = false
  private var meetingMuted = false

  private var voiceRecordingFilename: String = ""

  private var extension = new MeetingExtensionProp

  private var webcamsOnlyForModerator = false

  private def startRecordingVoice() {
    recordingVoice = true
  }

  private def stopRecordingVoice() {
    recordingVoice = false
  }

  private def isVoiceRecording: Boolean = {
    recordingVoice
  }

  private def isExtensionAllowed(): Boolean = extension.numExtensions < extension.maxExtensions
  private def incNumExtension(): Int = {
    if (extension.numExtensions < extension.maxExtensions) {
      extension = extension.copy(numExtensions = extension.numExtensions + 1); extension.numExtensions
    }
    extension.numExtensions
  }

  private def notice15MinutesSent() = extension = extension.copy(sent15MinNotice = true)
  private def notice10MinutesSent() = extension = extension.copy(sent10MinNotice = true)
  private def notice5MinutesSent() = extension = extension.copy(sent5MinNotice = true)

  private def getMeetingExtensionProp(): MeetingExtensionProp = extension
  private def muteMeeting() = meetingMuted = true
  private def unmuteMeeting() = meetingMuted = false
  private def isMeetingMuted(): Boolean = meetingMuted
  private def recordingStarted() = recording = true
  private def recordingStopped() = recording = false
  private def isRecording(): Boolean = recording

  private def setVoiceRecordingFilename(path: String) = voiceRecordingFilename = path
  private def getVoiceRecordingFilename(): String = voiceRecordingFilename
  private def permisionsInitialized(): Boolean = permissionsInited
  private def initializePermissions() = permissionsInited = true
  private def audioSettingsInitialized(): Boolean = audioSettingsInited
  private def initializeAudioSettings() = audioSettingsInited = true
  private def permissionsEqual(other: Permissions): Boolean = permissions == other
  private def lockLayout(lock: Boolean) = permissions = permissions.copy(lockedLayout = lock)
  private def getPermissions(): Permissions = permissions
  private def setPermissions(p: Permissions) = permissions = p
  private def meetingHasEnded() = meetingEnded = true
  private def hasMeetingEnded(): Boolean = meetingEnded

}
