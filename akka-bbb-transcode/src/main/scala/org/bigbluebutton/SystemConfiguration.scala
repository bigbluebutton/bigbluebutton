package org.bigbluebutton

import scala.util.Try
import com.typesafe.config.ConfigFactory

trait SystemConfiguration {
  val config = ConfigFactory.load()

  // Redis server configuration
  lazy val redisHost = Try(config.getString("redis.host")).getOrElse("127.0.0.1")
  lazy val redisPort = Try(config.getInt("redis.port")).getOrElse(6379)
  lazy val redisPassword = Try(config.getString("redis.password")).getOrElse("")
  lazy val redisExpireKey = Try(config.getInt("redis.keyExpiry")).getOrElse(1209600)

  lazy val _ffmpegPath = Try(config.getString("transcoder.ffmpeg-path")).getOrElse("/usr/local/bin/ffmpeg")
  lazy val _ffprobePath = Try(config.getString("transcoder.ffprobe-path")).getOrElse("/usr/local/bin/ffprobe")

  lazy val _videoconfLogoImagePath = Try(config.getString("videoconference.videoconf-logo-image-path")).getOrElse("")
  lazy val _enableUserVideoSubtitle = Try(config.getString("videoconference.enable-user-video-subtitle").toBoolean).getOrElse(false)
  lazy val _sipVideoResolution = Try(config.getString("videoconference.sip-video-resolution")).getOrElse("")

  lazy val toAkkaTranscodeRedisChannel = Try(config.getString("redis.toAkkaTranscodeRedisChannel")).getOrElse("bigbluebutton:to-bbb-transcode:system")
  lazy val fromAkkaTranscodeRedisChannel = Try(config.getString("redis.fromAkkaTranscodeRedisChannel")).getOrElse("bigbluebutton:from-bbb-transcode:system")
  lazy val toAkkaTranscodeJsonChannel = Try(config.getString("eventBus.toAkkaTranscodeJsonChannel")).getOrElse("to-akka-transcode-json-channel")
  lazy val fromAkkaTranscodeJsonChannel = Try(config.getString("eventBus.fromAkkaTranscodeJsonChannel")).getOrElse("from-akka-transcode-json-channel")
}
