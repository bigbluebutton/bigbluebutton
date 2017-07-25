package org.bigbluebutton.transcode.core

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.transcode.core.ffmpeg.FFmpegUtils

class TranscodersService {}

object TranscodersService extends SystemConfiguration {

  def ffmpegPath(): String = {
    _ffmpegPath
  }

  def ffprobePath(): String = {
    _ffprobePath
  }

  def videoconfLogoImagePath(): String = {
    _videoconfLogoImagePath
  }

  def enableUserVideoSubtitle(): Boolean = {
    _enableUserVideoSubtitle
  }

  def sipVideoResolution(): String = {
    _sipVideoResolution
  }
}
