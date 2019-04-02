package org.bigbluebutton

import scala.util.Try

import org.bigbluebutton.common2.redis.RedisConfiguration

trait SystemConfiguration extends RedisConfiguration {
  lazy val eslHost = Try(config.getString("freeswitch.esl.host")).getOrElse("127.0.0.1")
  lazy val eslPort = Try(config.getInt("freeswitch.esl.port")).getOrElse(8021)
  lazy val eslPassword = Try(config.getString("freeswitch.esl.password")).getOrElse("ClueCon")
  lazy val fsProfile = Try(config.getString("freeswitch.conf.profile")).getOrElse("cdquality")

  lazy val toFsAppsJsonChannel = Try(config.getString("eventBus.toFsAppsChannel")).getOrElse("to-fs-apps-json-channel")
  lazy val fromFsAppsJsonChannel = Try(config.getString("eventBus.fromFsAppsChannel")).getOrElse("from-fs-apps-json-channel")
}
