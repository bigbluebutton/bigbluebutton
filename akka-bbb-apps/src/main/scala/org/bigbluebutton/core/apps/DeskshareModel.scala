package org.bigbluebutton.core.apps

object DeskshareModel {
  def resetDesktopSharingParams(status: DeskshareModel) = {
    status.broadcastingRTMP = false
    status.deskShareStarted = false
    status.rtmpBroadcastingUrl = ""
    status.desktopShareVideoWidth = 0
    status.desktopShareVideoHeight = 0
  }

  def getDeskShareStarted(status: DeskshareModel): Boolean = {
    return status.deskShareStarted
  }

  def setDeskShareStarted(status: DeskshareModel, b: Boolean) {
    status.deskShareStarted = b
  }

  def setDesktopShareVideoWidth(status: DeskshareModel, videoWidth: Int) {
    status.desktopShareVideoWidth = videoWidth
  }

  def setDesktopShareVideoHeight(status: DeskshareModel, videoHeight: Int) {
    status.desktopShareVideoHeight = videoHeight
  }

  def getDesktopShareVideoWidth(status: DeskshareModel): Int = {
    status.desktopShareVideoWidth
  }

  def getDesktopShareVideoHeight(status: DeskshareModel): Int = {
    status.desktopShareVideoHeight
  }

  def broadcastingRTMPStarted(status: DeskshareModel) {
    status.broadcastingRTMP = true
  }

  def isBroadcastingRTMP(status: DeskshareModel): Boolean = {
    status.broadcastingRTMP
  }

  def broadcastingRTMPStopped(status: DeskshareModel) {
    status.broadcastingRTMP = false
  }

  def setRTMPBroadcastingUrl(status: DeskshareModel, path: String) {
    status.rtmpBroadcastingUrl = path
  }

  def getRTMPBroadcastingUrl(status: DeskshareModel): String = {
    status.rtmpBroadcastingUrl
  }
}

class DeskshareModel {
  private var rtmpBroadcastingUrl: String = ""
  private var deskShareStarted = false
  private var desktopShareVideoWidth = 0
  private var desktopShareVideoHeight = 0
  private var broadcastingRTMP = false

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
}
