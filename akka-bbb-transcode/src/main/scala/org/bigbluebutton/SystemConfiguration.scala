package org.bigbluebutton

import scala.util.Try

import org.bigbluebutton.common2.redis.RedisConfiguration

trait SystemConfiguration extends RedisConfiguration {
  lazy val _ffmpegPath = Try(config.getString("transcoder.ffmpeg-path")).getOrElse("/usr/local/bin/ffmpeg")
  lazy val _ffprobePath = Try(config.getString("transcoder.ffprobe-path")).getOrElse("/usr/local/bin/ffprobe")

  lazy val _videoconfLogoImagePath = Try(config.getString("videoconference.videoconf-logo-image-path")).getOrElse("")
  lazy val _enableUserVideoSubtitle = Try(config.getString("videoconference.enable-user-video-subtitle").toBoolean).getOrElse(false)
  lazy val _sipVideoResolution = Try(config.getString("videoconference.sip-video-resolution")).getOrElse("")
}
