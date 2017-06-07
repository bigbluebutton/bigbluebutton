package org.bigbluebutton.core2

import java.util.concurrent.TimeUnit

import org.bigbluebutton.core.MeetingExtensionProp
import org.bigbluebutton.core.api.{ GuestPolicy, Permissions, Presenter }

object MeetingStatus2x {
  def setCurrentPresenterInfo(status: MeetingStatus2x, pres: Presenter) {
    status.currentPresenter = pres
  }

  def getCurrentPresenterInfo(status: MeetingStatus2x): Presenter = {
    status.currentPresenter
  }

  def addGlobalAudioConnection(status: MeetingStatus2x, userID: String): Boolean = {
    status.globalAudioConnectionCounter.get(userID) match {
      case Some(vc) => {
        status.globalAudioConnectionCounter += userID -> (vc + 1)
        false
      }
      case None => {
        status.globalAudioConnectionCounter += userID -> 1
        true
      }
    }
  }

  def removeGlobalAudioConnection(status: MeetingStatus2x, userID: String): Boolean = {
    status.globalAudioConnectionCounter.get(userID) match {
      case Some(vc) => {
        if (vc == 1) {
          status.globalAudioConnectionCounter -= userID
          true
        } else {
          status.globalAudioConnectionCounter += userID -> (vc - 1)
          false
        }
      }
      case None => {
        false
      }
    }
  }

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

  def resetDesktopSharingParams(status: MeetingStatus2x) = {
    status.broadcastingRTMP = false
    status.deskShareStarted = false
    status.rtmpBroadcastingUrl = ""
    status.desktopShareVideoWidth = 0
    status.desktopShareVideoHeight = 0
  }

  def getDeskShareStarted(status: MeetingStatus2x): Boolean = {
    return status.deskShareStarted
  }

  def setDeskShareStarted(status: MeetingStatus2x, b: Boolean) {
    status.deskShareStarted = b
  }

  def setDesktopShareVideoWidth(status: MeetingStatus2x, videoWidth: Int) {
    status.desktopShareVideoWidth = videoWidth
  }

  def setDesktopShareVideoHeight(status: MeetingStatus2x, videoHeight: Int) {
    status.desktopShareVideoHeight = videoHeight
  }

  def getDesktopShareVideoWidth(status: MeetingStatus2x): Int = {
    status.desktopShareVideoWidth
  }

  def getDesktopShareVideoHeight(status: MeetingStatus2x): Int = {
    status.desktopShareVideoHeight
  }

  def broadcastingRTMPStarted(status: MeetingStatus2x) {
    status.broadcastingRTMP = true
  }

  def isBroadcastingRTMP(status: MeetingStatus2x): Boolean = {
    status.broadcastingRTMP
  }

  def broadcastingRTMPStopped(status: MeetingStatus2x) {
    status.broadcastingRTMP = false
  }

  def setRTMPBroadcastingUrl(status: MeetingStatus2x, path: String) {
    status.rtmpBroadcastingUrl = path
  }

  def getRTMPBroadcastingUrl(status: MeetingStatus2x): String = {
    status.rtmpBroadcastingUrl
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
  def lastWebUserLeft(status: MeetingStatus2x) = status.lastWebUserLeftOnTimestamp = MeetingStatus2x.timeNowInMinutes
  def lastWebUserLeftOn(status: MeetingStatus2x): Long = status.lastWebUserLeftOnTimestamp
  def resetLastWebUserLeftOn(status: MeetingStatus2x) = status.lastWebUserLeftOnTimestamp = 0
  def setVoiceRecordingFilename(status: MeetingStatus2x, path: String) = status.voiceRecordingFilename = path
  def getVoiceRecordingFilename(status: MeetingStatus2x): String = status.voiceRecordingFilename
  def permisionsInitialized(status: MeetingStatus2x): Boolean = status.permissionsInited
  def initializePermissions(status: MeetingStatus2x) = status.permissionsInited = true
  def audioSettingsInitialized(status: MeetingStatus2x): Boolean = status.audioSettingsInited
  def initializeAudioSettings(status: MeetingStatus2x) = status.audioSettingsInited = true
  def permissionsEqual(status: MeetingStatus2x, other: Permissions): Boolean = status.permissions == other
  def lockLayout(status: MeetingStatus2x, lock: Boolean) = status.permissions = status.permissions.copy(lockedLayout = lock)
  def getPermissions(status: MeetingStatus2x): Permissions = status.permissions
  def setPermissions(status: MeetingStatus2x, p: Permissions) = status.permissions = p
  def meetingHasEnded(status: MeetingStatus2x) = status.meetingEnded = true
  def hasMeetingEnded(status: MeetingStatus2x): Boolean = status.meetingEnded
  def timeNowInMinutes(status: MeetingStatus2x): Long = TimeUnit.NANOSECONDS.toMinutes(System.nanoTime())
  def timeNowInSeconds(status: MeetingStatus2x): Long = TimeUnit.NANOSECONDS.toSeconds(System.nanoTime())
  def getGuestPolicy(status: MeetingStatus2x): GuestPolicy.GuestPolicy = status.guestPolicy
  def setGuestPolicy(status: MeetingStatus2x, policy: GuestPolicy.GuestPolicy) = status.guestPolicy = policy
  def getGuestPolicySetBy(status: MeetingStatus2x): String = status.guestPolicySetBy
  def setGuestPolicySetBy(status: MeetingStatus2x, user: String) = status.guestPolicySetBy = user

  def startedOn(status: MeetingStatus2x): Long = status.startedOn

  def breakoutRoomsStartedOn(status: MeetingStatus2x) = status.breakoutRoomsStartedOn
  def breakoutRoomsStartedOn(status: MeetingStatus2x, startedOn: Long) = status.breakoutRoomsStartedOn = startedOn

  def breakoutRoomsdurationInMinutes(status: MeetingStatus2x) = status.breakoutRoomsdurationInMinutes
  def breakoutRoomsdurationInMinutes(status: MeetingStatus2x, duration: Int) = status.breakoutRoomsdurationInMinutes = duration

  def timeNowInMinutes(): Long = TimeUnit.NANOSECONDS.toMinutes(System.nanoTime())
  def timeNowInSeconds(): Long = TimeUnit.NANOSECONDS.toSeconds(System.nanoTime())
}

class MeetingStatus2x {
  private var globalAudioConnectionCounter = new collection.immutable.HashMap[String, Integer]

  private var recordingVoice = false

  private var currentPresenter = new Presenter("system", "system", "system")
  private var audioSettingsInited = false
  private var permissionsInited = false
  private var permissions = new Permissions()
  private var recording = false
  private var broadcastingRTMP = false
  private var muted = false
  private var meetingEnded = false
  private var meetingMuted = false
  private var guestPolicy = GuestPolicy.ASK_MODERATOR
  private var guestPolicySetBy: String = null

  private var hasLastWebUserLeft = false
  private var lastWebUserLeftOnTimestamp: Long = 0

  private var voiceRecordingFilename: String = ""
  private var rtmpBroadcastingUrl: String = ""
  private var deskShareStarted = false
  private var desktopShareVideoWidth = 0
  private var desktopShareVideoHeight = 0

  private var extension = new MeetingExtensionProp

  private val startedOn = MeetingStatus2x.timeNowInSeconds;
  private var breakoutRoomsStartedOn: Long = 0
  private var breakoutRoomsdurationInMinutes: Int = 0

  private def setCurrentPresenterInfo(pres: Presenter) {
    currentPresenter = pres
  }

  private def getCurrentPresenterInfo(): Presenter = {
    currentPresenter
  }

  private def addGlobalAudioConnection(userID: String): Boolean = {
    globalAudioConnectionCounter.get(userID) match {
      case Some(vc) => {
        globalAudioConnectionCounter += userID -> (vc + 1)
        false
      }
      case None => {
        globalAudioConnectionCounter += userID -> 1
        true
      }
    }
  }

  private def removeGlobalAudioConnection(userID: String): Boolean = {
    globalAudioConnectionCounter.get(userID) match {
      case Some(vc) => {
        if (vc == 1) {
          globalAudioConnectionCounter -= userID
          true
        } else {
          globalAudioConnectionCounter += userID -> (vc - 1)
          false
        }
      }
      case None => {
        false
      }
    }
  }

  private def startRecordingVoice() {
    recordingVoice = true
  }

  private def stopRecordingVoice() {
    recordingVoice = false
  }

  private def isVoiceRecording: Boolean = {
    recordingVoice
  }

  private def resetDesktopSharingParams() = {
    broadcastingRTMP = false
    deskShareStarted = false
    rtmpBroadcastingUrl = ""
    desktopShareVideoWidth = 0
    desktopShareVideoHeight = 0
  }

  private def getDeskShareStarted(): Boolean = {
    return deskShareStarted
  }

  private def setDeskShareStarted(b: Boolean) {
    deskShareStarted = b
  }

  private def setDesktopShareVideoWidth(videoWidth: Int) {
    desktopShareVideoWidth = videoWidth
  }

  private def setDesktopShareVideoHeight(videoHeight: Int) {
    desktopShareVideoHeight = videoHeight
  }

  private def getDesktopShareVideoWidth(): Int = {
    desktopShareVideoWidth
  }

  private def getDesktopShareVideoHeight(): Int = {
    desktopShareVideoHeight
  }

  private def broadcastingRTMPStarted() {
    broadcastingRTMP = true
  }

  private def isBroadcastingRTMP(): Boolean = {
    broadcastingRTMP
  }

  private def broadcastingRTMPStopped() {
    broadcastingRTMP = false
  }

  private def setRTMPBroadcastingUrl(path: String) {
    rtmpBroadcastingUrl = path
  }

  private def getRTMPBroadcastingUrl(): String = {
    rtmpBroadcastingUrl
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
  private def lastWebUserLeft() = lastWebUserLeftOnTimestamp = MeetingStatus2x.timeNowInMinutes
  private def lastWebUserLeftOn(): Long = lastWebUserLeftOnTimestamp
  private def resetLastWebUserLeftOn() = lastWebUserLeftOnTimestamp = 0
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

  private def getGuestPolicy(): GuestPolicy.GuestPolicy = guestPolicy
  private def setGuestPolicy(policy: GuestPolicy.GuestPolicy) = guestPolicy = policy
  private def getGuestPolicySetBy(): String = guestPolicySetBy
  private def setGuestPolicySetBy(user: String) = guestPolicySetBy = user
}
