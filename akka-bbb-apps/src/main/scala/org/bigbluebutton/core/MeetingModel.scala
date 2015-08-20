package org.bigbluebutton.core

import org.bigbluebutton.core.api.Permissions
import java.util.concurrent.TimeUnit

class MeetingModel {
  private var audioSettingsInited = false
  private var permissionsInited = false
  private var permissions = new Permissions()
  private var recording = false;
  private var muted = false;
  private var meetingEnded = false
  private var voiceRecordingFilename: String = ""

  val TIMER_INTERVAL = 30000
  private var hasLastWebUserLeft = false
  private var lastWebUserLeftOnTimestamp: Long = 0

  // Desktop Sharing
  private var broadcastingRTMP = false
  private var rtmpBroadcastingUrl: String = ""
  private var deskShareInProgress = false
  private var deskShareVideoHeight = 0
  private var deskShareVideoWidth = 0

  val startedOn = timeNowInMinutes;

  def getDeskShareInProgress(): Boolean = {
    return deskShareInProgress
  }

  def setDeskShareInProgress(b: Boolean) {
    deskShareInProgress = b
  }

  def recordingStarted() {
    recording = true
  }

  def recordingStopped() {
    recording = false
  }

  def isRecording(): Boolean = {
    recording
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

  def setDeskShareVideoHeight(height: Int) {
    deskShareVideoHeight = height
  }

  def getDeskShareVideoHeight(): Int = {
    deskShareVideoHeight
  }

  def setDeskShareVideoWidth(width: Int) {
    deskShareVideoWidth = width
  }

  def getDeskShareVideoWidth(): Int = {
    deskShareVideoWidth
  }

  def lastWebUserLeft() {
    lastWebUserLeftOnTimestamp = timeNowInMinutes
  }

  def lastWebUserLeftOn(): Long = {
    lastWebUserLeftOnTimestamp
  }

  def resetLastWebUserLeftOn() {
    lastWebUserLeftOnTimestamp = 0
  }

  def setVoiceRecordingFilename(path: String) {
    voiceRecordingFilename = path
  }

  def getVoiceRecordingFilename(): String = {
    voiceRecordingFilename
  }

  def setRTMPBroadcastingUrl(path: String) {
    rtmpBroadcastingUrl = path
  }

  def getRTMPBroadcastingUrl(): String = {
    rtmpBroadcastingUrl
  }

  def permisionsInitialized(): Boolean = {
    permissionsInited
  }

  def initializePermissions() {
    permissionsInited = true
  }

  def audioSettingsInitialized(): Boolean = {
    audioSettingsInited
  }

  def initializeAudioSettings() {
    audioSettingsInited = true
  }

  def permissionsEqual(other: Permissions): Boolean = {
    permissions == other
  }

  def lockLayout(lock: Boolean) {
    permissions = permissions.copy(lockedLayout = lock)
  }

  def getPermissions(): Permissions = {
    permissions
  }

  def setPermissions(p: Permissions) {
    permissions = p
  }

  def meetingHasEnded() {
    meetingEnded = true
  }

  def hasMeetingEnded(): Boolean = {
    meetingEnded
  }

  def timeNowInMinutes(): Long = {
    TimeUnit.NANOSECONDS.toMinutes(System.nanoTime())
  }
}