package org.bigbluebutton.core

import org.bigbluebutton.core.api.Permissions
import java.util.concurrent.TimeUnit

case object StopMeetingActor
case class MeetingProperties(meetingID: String, externalMeetingID: String, parentMeetingID: String, meetingName: String,
  recorded: Boolean, voiceBridge: String, deskshareBridge: String, duration: Int,
  autoStartRecording: Boolean, allowStartStopRecording: Boolean, webcamsOnlyForModerator: Boolean,
  moderatorPass: String, viewerPass: String, createTime: Long, createDate: String,
  red5DeskShareIP: String, red5DeskShareApp: String, isBreakout: Boolean, sequence: Int)

case class MeetingExtensionProp(maxExtensions: Int = 2, numExtensions: Int = 0, extendByMinutes: Int = 20,
  sendNotice: Boolean = true, sent15MinNotice: Boolean = false,
  sent10MinNotice: Boolean = false, sent5MinNotice: Boolean = false)

class MeetingModel {
  private var audioSettingsInited = false
  private var permissionsInited = false
  private var permissions = new Permissions()
  private var recording = false;
  private var broadcastingRTMP = false
  private var muted = false;
  private var meetingEnded = false
  private var meetingMuted = false

  private var hasLastWebUserLeft = false
  private var lastWebUserLeftOnTimestamp: Long = 0

  private var voiceRecordingFilename: String = ""
  private var rtmpBroadcastingUrl: String = ""
  private var deskShareStarted = false
  private var desktopShareVideoWidth = 0
  private var desktopShareVideoHeight = 0

  private var extension = new MeetingExtensionProp

  val startedOn = timeNowInSeconds;

  var breakoutRoomsStartedOn: Long = 0;
  var breakoutRoomsdurationInMinutes: Int = 0;

  def resetDesktopSharingParams() = {
    broadcastingRTMP = false
    deskShareStarted = false
    rtmpBroadcastingUrl = ""
    desktopShareVideoWidth = 0
    desktopShareVideoHeight = 0
  }

  def getDeskShareStarted(): Boolean = {
    return deskShareStarted
  }

  def setDeskShareStarted(b: Boolean) {
    deskShareStarted = b
    println("---deskshare status changed to:" + b)
  }

  def setDesktopShareVideoWidth(videoWidth: Int) {
    desktopShareVideoWidth = videoWidth
  }

  def setDesktopShareVideoHeight(videoHeight: Int) {
    desktopShareVideoHeight = videoHeight
  }

  def getDesktopShareVideoWidth(): Int = {
    desktopShareVideoWidth
  }

  def getDesktopShareVideoHeight(): Int = {
    desktopShareVideoHeight
  }

  def broadcastingRTMPStarted() {
    broadcastingRTMP = true
  }

  def isBroadcastingRTMP(): Boolean = {
    broadcastingRTMP
  }

  def broadcastingRTMPStopped() {
    broadcastingRTMP = false
  }

  def setRTMPBroadcastingUrl(path: String) {
    println("---RTMP broadcastUrl changed to:" + path)
    rtmpBroadcastingUrl = path
  }

  def getRTMPBroadcastingUrl(): String = {
    rtmpBroadcastingUrl
  }

  def isExtensionAllowed(): Boolean = extension.numExtensions < extension.maxExtensions
  def incNumExtension(): Int = {
    if (extension.numExtensions < extension.maxExtensions) {
      extension = extension.copy(numExtensions = extension.numExtensions + 1); extension.numExtensions
    }
    extension.numExtensions
  }

  def notice15MinutesSent() = extension = extension.copy(sent15MinNotice = true)
  def notice10MinutesSent() = extension = extension.copy(sent10MinNotice = true)
  def notice5MinutesSent() = extension = extension.copy(sent5MinNotice = true)

  def getMeetingExtensionProp(): MeetingExtensionProp = extension
  def muteMeeting() = meetingMuted = true
  def unmuteMeeting() = meetingMuted = false
  def isMeetingMuted(): Boolean = meetingMuted
  def recordingStarted() = recording = true
  def recordingStopped() = recording = false
  def isRecording(): Boolean = recording
  def lastWebUserLeft() = lastWebUserLeftOnTimestamp = timeNowInMinutes
  def lastWebUserLeftOn(): Long = lastWebUserLeftOnTimestamp
  def resetLastWebUserLeftOn() = lastWebUserLeftOnTimestamp = 0
  def setVoiceRecordingFilename(path: String) = voiceRecordingFilename = path
  def getVoiceRecordingFilename(): String = voiceRecordingFilename
  def permisionsInitialized(): Boolean = permissionsInited
  def initializePermissions() = permissionsInited = true
  def audioSettingsInitialized(): Boolean = audioSettingsInited
  def initializeAudioSettings() = audioSettingsInited = true
  def permissionsEqual(other: Permissions): Boolean = permissions == other
  def lockLayout(lock: Boolean) = permissions = permissions.copy(lockedLayout = lock)
  def getPermissions(): Permissions = permissions
  def setPermissions(p: Permissions) = permissions = p
  def meetingHasEnded() = meetingEnded = true
  def hasMeetingEnded(): Boolean = meetingEnded
  def timeNowInMinutes(): Long = TimeUnit.NANOSECONDS.toMinutes(System.nanoTime())
  def timeNowInSeconds(): Long = TimeUnit.NANOSECONDS.toSeconds(System.nanoTime())
}
