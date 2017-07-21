package org.bigbluebutton.core.apps

object ScreenshareModel {
  def resetDesktopSharingParams(status: ScreenshareModel) = {
    status.broadcastingRTMP = false
    status.screenshareStarted = false
    status.rtmpBroadcastingUrl = ""
    status.screenshareVideoWidth = 0
    status.screenshareVideoHeight = 0
    status.voiceConf = ""
    status.screenshareConf = ""
    status.timestamp = ""
  }

  def getScreenshareStarted(status: ScreenshareModel): Boolean = {
    return status.screenshareStarted
  }

  def setScreenshareStarted(status: ScreenshareModel, b: Boolean) {
    status.screenshareStarted = b
  }

  def setScreenshareVideoWidth(status: ScreenshareModel, videoWidth: Int) {
    status.screenshareVideoWidth = videoWidth
  }

  def setScreenshareVideoHeight(status: ScreenshareModel, videoHeight: Int) {
    status.screenshareVideoHeight = videoHeight
  }

  def getScreenshareVideoWidth(status: ScreenshareModel): Int = {
    status.screenshareVideoWidth
  }

  def getScreenshareVideoHeight(status: ScreenshareModel): Int = {
    status.screenshareVideoHeight
  }

  def broadcastingRTMPStarted(status: ScreenshareModel) {
    status.broadcastingRTMP = true
  }

  def isBroadcastingRTMP(status: ScreenshareModel): Boolean = {
    status.broadcastingRTMP
  }

  def broadcastingRTMPStopped(status: ScreenshareModel) {
    status.broadcastingRTMP = false
  }

  def setRTMPBroadcastingUrl(status: ScreenshareModel, path: String) {
    status.rtmpBroadcastingUrl = path
  }

  def getRTMPBroadcastingUrl(status: ScreenshareModel): String = {
    status.rtmpBroadcastingUrl
  }

  def setVoiceConf(status: ScreenshareModel, voiceConf: String): Unit = {
    status.voiceConf = voiceConf
  }

  def getVoiceConf(status: ScreenshareModel): String = {
    status.voiceConf
  }

  def setScreenshareConf(status: ScreenshareModel, screenshareConf: String): Unit = {
    status.screenshareConf = screenshareConf
  }

  def getScreenshareConf(status: ScreenshareModel): String = {
    status.screenshareConf
  }

  def setTimestamp(status: ScreenshareModel, timestamp: String): Unit = {
    status.timestamp = timestamp
  }

  def getTimestamp(status: ScreenshareModel): String = {
    status.timestamp
  }
}

class ScreenshareModel {
  private var rtmpBroadcastingUrl: String = ""
  private var screenshareStarted = false
  private var screenshareVideoWidth = 0
  private var screenshareVideoHeight = 0
  private var broadcastingRTMP = false
  private var voiceConf: String = ""
  private var screenshareConf: String = ""
  private var timestamp: String = ""
}
