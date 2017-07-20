package org.bigbluebutton.core.apps

object ScreenshareModel {
  def resetDesktopSharingParams(status: ScreenshareModel) = {
    status.broadcastingRTMP = false
    status.screenshareStarted = false
    status.rtmpBroadcastingUrl = ""
    status.screenshareVideoWidth = 0
    status.screenshareVideoHeight = 0
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
}

class ScreenshareModel {
  private var rtmpBroadcastingUrl: String = ""
  private var screenshareStarted = false
  private var screenshareVideoWidth = 0
  private var screenshareVideoHeight = 0
  private var broadcastingRTMP = false

  private def resetDesktopSharingParams() = {
    broadcastingRTMP = false
    screenshareStarted = false
    rtmpBroadcastingUrl = ""
    screenshareVideoWidth = 0
    screenshareVideoHeight = 0
  }

  private def getScreenshareStarted(): Boolean = {
    return screenshareStarted
  }

  private def setScreenshareStarted(b: Boolean) {
    screenshareStarted = b
  }

  private def setScreenshareVideoWidth(videoWidth: Int) {
    screenshareVideoWidth = videoWidth
  }

  private def setScreenshareVideoHeight(videoHeight: Int) {
    screenshareVideoHeight = videoHeight
  }

  private def getScreenshareVideoWidth(): Int = {
    screenshareVideoWidth
  }

  private def getScreenshareVideoHeight(): Int = {
    screenshareVideoHeight
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
}
