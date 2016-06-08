package org.bigbluebutton.core.models

import org.bigbluebutton.core.domain._
import com.softwaremill.quicklens._

case class Meeting3x(
  abilities: Set[Abilities2x] = Set.empty,
  isRecording: Boolean = false,
  muted: Boolean = false,
  ended: Boolean = false,
  hasLastWebUserLeft: Boolean = false,
  lastWebUserLeftOnTimestamp: Long = 0L,
  voiceRecordingFilename: String = "",
  startedOn: Long = 0L,
  pinNumbers: Set[PinNumber] = Set.empty,
  lastGeneratedPin: Int = 0,
  breakoutRoomsStartedOn: Long = 0L,
  breakoutRoomsDurationInMinutes: Int = 120,
  extensionStatus: MeetingExtensionStatus = new MeetingExtensionStatus,
  recordingStatus: MeetingRecordingStatus = new MeetingRecordingStatus)

object Meeting3x {
  def isExtensionAllowed(
    extension: MeetingExtensionProp,
    status: MeetingExtensionStatus): Boolean = status.numExtensions < extension.maxExtensions

  def incNumExtension(extension: MeetingExtensionProp, status: MeetingExtensionStatus): MeetingExtensionStatus = {
    if (status.numExtensions < extension.maxExtensions) {
      modify(status)(_.numExtensions).setTo(status.numExtensions + 1)
    }
    status
  }

  def fifteenMinutesNoticeSent(extension: MeetingExtensionStatus): MeetingExtensionStatus = {
    modify(extension)(_.sent15MinNotice).setTo(true)
  }

  def tenMinutesNoticeSent(extension: MeetingExtensionStatus): MeetingExtensionStatus = {
    modify(extension)(_.sent10MinNotice).setTo(true)
  }

  def fiveMinutesNoticeSent(extension: MeetingExtensionStatus): MeetingExtensionStatus = {
    modify(extension)(_.sent5MinNotice).setTo(true)
  }

  def mute(meeting: Meeting3x): Meeting3x = {
    modify(meeting)(_.muted).setTo(true)
  }

  def unMute(meeting: Meeting3x): Meeting3x = {
    modify(meeting)(_.muted).setTo(false)
  }

  def recordingStarted(meeting: Meeting3x): Meeting3x = {
    modify(meeting)(_.isRecording).setTo(true)
  }

  def recordingStopped(meeting: Meeting3x): Meeting3x = {
    modify(meeting)(_.isRecording).setTo(false)
  }

}

object PinNumberGenerator {
  def generatePin(conf: VoiceConf, meeting: Meeting3x): PinNumber = {
    def inc(curPin: Int): Int = {
      if ((curPin + 1) < 1000) curPin + 1
      else 1
    }

    def genAvailablePin(): PinNumber = {
      val pin = conf.value.toInt + inc(meeting.lastGeneratedPin)
      val myPin = PinNumber(pin)
      if (meeting.pinNumbers.contains(myPin)) genAvailablePin
      myPin
    }

    genAvailablePin
  }
}