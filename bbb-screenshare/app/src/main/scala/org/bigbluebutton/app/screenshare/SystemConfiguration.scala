package org.bigbluebutton.app.screenshare

import scala.util.Try
import com.typesafe.config.ConfigFactory
import org.bigbluebutton.common2.redis.RedisConfiguration

trait SystemConfiguration extends RedisConfiguration {

  lazy val meetingManagerChannel = Try(config.getString("eventBus.meetingManagerChannel")).getOrElse("NOT FROM APP CONF")

  lazy val toScreenshareAppsJsonChannel = Try(config.getString("eventBus.toAkkaAppsChannel")).getOrElse("to-screenshare-apps-json-channel")
}
