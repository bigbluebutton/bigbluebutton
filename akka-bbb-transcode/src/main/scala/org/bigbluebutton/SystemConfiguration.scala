package org.bigbluebutton

import com.typesafe.config.ConfigFactory
import scala.util.Try

trait SystemConfiguration {

  val config = ConfigFactory.load()

  lazy val redisHost = Try(config.getString("redis.host")).getOrElse("127.0.0.1")
  lazy val redisPort = Try(config.getInt("redis.port")).getOrElse(6379)
  lazy val redisPassword = Try(config.getString("redis.password")).getOrElse("")

  lazy val _ffmpegPath = Try(config.getString("transcoder.ffmpeg-path")).getOrElse("/usr/local/bin/ffmpeg")
  lazy val _ffprobePath = Try(config.getString("transcoder.ffprobe-path")).getOrElse("/usr/local/bin/ffprobe")

  lazy val _videoconfLogoImagePath = Try(config.getString("videoconference.videoconf-logo-image-path")).getOrElse("")
  lazy val _enableUserVideoSubtitle = Try(config.getString("videoconference.enable-user-video-subtitle").toBoolean).getOrElse(false)
  lazy val _sipVideoResolution = Try(config.getString("videoconference.sip-video-resolution")).getOrElse("")
}
