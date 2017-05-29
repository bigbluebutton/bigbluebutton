package org.bigbluebutton.core2

import org.bigbluebutton.core.MeetingExtensionProp
import org.bigbluebutton.core.api.{GuestPolicy, Permissions, Presenter}

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

  val startedOn = timeNowInSeconds;
  var breakoutRoomsStartedOn: Long = 0
  var breakoutRoomsdurationInMinutes: Int = 0

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
}
