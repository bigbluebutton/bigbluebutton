package org.bigbluebutton.core.domain

import com.softwaremill.quicklens._
import org.bigbluebutton.core.api.Permissions

case class MeetingProperties(
  id:                      String,
  extId:                   String,
  name:                    String,
  recorded:                Boolean,
  voiceConf:               String,
  duration:                Int,
  autoStartRecording:      Boolean,
  allowStartStopRecording: Boolean,
  moderatorPass:           String,
  viewerPass:              String,
  createTime:              Long,
  createDate:              String,
  isBreakout:              Boolean
)

case class MeetingProperties2x(
  id:             String,
  extId:          String,
  name:           String,
  voiceConf:      String,
  duration:       Int,
  maxUsers:       Int,
  allowVoiceOnly: Boolean,
  isBreakout:     Boolean,
  extensionProp:  MeetingExtensionProp,
  recordingProp:  MeetingRecordingProp
)

case class MeetingRecordingProp(
  recorded:                Boolean = false,
  autoStartRecording:      Boolean = false,
  allowStartStopRecording: Boolean = true
)

case class MeetingExtensionProp(
  maxExtensions:   Int     = 0,
  extendByMinutes: Int     = 20,
  sendNotice:      Boolean = true
)

case class MeetingRecordingStatus(
  recording:              Boolean = false,
  voiceRecordingFilename: String  = ""
)

case class MeetingExtensionStatus(
  numExtensions:   Int     = 0,
  sent15MinNotice: Boolean = false,
  sent10MinNotice: Boolean = false,
  sent5MinNotice:  Boolean = false
)

case class Meeting3x(
  permissions:                    Permissions,
  isRecording:                    Boolean                = false,
  webcamsOnlyForModerator:        Boolean                = false,
  muted:                          Boolean                = false,
  ended:                          Boolean                = false,
  hasLastWebUserLeft:             Boolean                = false,
  lastWebUserLeftOnTimestamp:     Long                   = 0L,
  voiceRecordingFilename:         String                 = "",
  startedOn:                      Long                   = 0L,
  pinNumbers:                     Set[String]            = Set.empty,
  lastGeneratedPin:               Int                    = 0,
  breakoutRoomsStartedOn:         Long                   = 0L,
  breakoutRoomsDurationInMinutes: Int                    = 120,
  extensionStatus:                MeetingExtensionStatus = new MeetingExtensionStatus,
  recordingStatus:                MeetingRecordingStatus = new MeetingRecordingStatus
)

object Meeting3x {
  def isExtensionAllowed(
    extension: MeetingExtensionProp,
    status:    MeetingExtensionStatus
  ): Boolean = status.numExtensions < extension.maxExtensions

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
  def generatePin(conf: String, meeting: Meeting3x): String = {
    def inc(curPin: Int): Int = {
      if ((curPin + 1) < 1000) curPin + 1
      else 1
    }

    def genAvailablePin(): Int = {
      val pin = conf.toInt + inc(meeting.lastGeneratedPin)
      if (meeting.pinNumbers.contains(pin.toString)) genAvailablePin
      pin
    }

    genAvailablePin.toString
  }
}