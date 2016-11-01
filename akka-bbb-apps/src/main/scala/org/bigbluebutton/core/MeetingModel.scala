package org.bigbluebutton.core

import org.bigbluebutton.core.api.GuestPolicy
import org.bigbluebutton.core.api.Metadata
import org.bigbluebutton.core.api.Permissions
import java.util.concurrent.TimeUnit

case object StopMeetingActor
case class MeetingProperties(meetingID: String, externalMeetingID: String, meetingName: String, recorded: Boolean,
  voiceBridge: String, duration: Long, autoStartRecording: Boolean, allowStartStopRecording: Boolean,
  moderatorPass: String, viewerPass: String, createTime: Long, createDate: String, metadata: java.util.Map[String, String])

class MeetingModel {
  private var audioSettingsInited = false
  private var permissionsInited = false
  private var permissions = new Permissions()
  private var recording = false;
  private var muted = false;
  private var meetingEnded = false
  private var meetingMuted = false
  private var guestPolicy = GuestPolicy.ASK_MODERATOR
  private var guestPolicySetBy: String = null

  val TIMER_INTERVAL = 30000
  private var hasLastWebUserLeft = false
  private var lastWebUserLeftOnTimestamp: Long = 0

  private var voiceRecordingFilename: String = ""

  val startedOn = timeNowInMinutes;

  def muteMeeting() {
    meetingMuted = true
  }

  def unmuteMeeting() {
    meetingMuted = false
  }

  def isMeetingMuted(): Boolean = {
    meetingMuted
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

  def getGuestPolicy(): GuestPolicy.GuestPolicy = {
    guestPolicy
  }

  def setGuestPolicy(policy: GuestPolicy.GuestPolicy) {
    guestPolicy = policy
  }

  def getGuestPolicySetBy(): String = {
    guestPolicySetBy
  }

  def setGuestPolicySetBy(user: String) {
    guestPolicySetBy = user
  }

  def getMetadata(key: String, metadata: java.util.Map[String, String]): Option[Object] = {
    var value: Option[String] = None
    if (metadata.containsKey(key)) {
      value = Some(metadata.get(key))
    }

    value match {
      case Some(v) => {
        key match {
          case Metadata.INACTIVITY_DEADLINE => {
            // Can be defined between 5 minutes to 2 hours
            metadataIntegerValueOf(v, 300, 7200) match {
              case Some(r) => Some(r.asInstanceOf[Object])
              case None => None
            }
          }
          case Metadata.INACTIVITY_TIMELEFT => {
            // Can be defined between 30 seconds to 5 minutes
            metadataIntegerValueOf(v, 30, 300) match {
              case Some(r) => Some(r.asInstanceOf[Object])
              case None => None
            }
          }
          case _ => None
        }
      }
      case None => None
    }
  }

  private def metadataIntegerValueOf(value: String, lowerBound: Int, upperBound: Int): Option[Int] = {
    stringToInt(value) match {
      case Some(r) => {
        if (lowerBound <= r && r <= upperBound) {
          Some(r)
        } else {
          None
        }
      }
      case None => None
    }
  }

  private def stringToInt(value: String): Option[Int] = {
    var result: Option[Int] = None
    try {
      result = Some(Integer.parseInt(value))
    } catch {
      case e: Exception => {
        result = None
      }
    }
    result
  }
}