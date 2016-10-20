package org.bigbluebutton

import com.typesafe.config.ConfigFactory
import scala.util.Try

trait SystemConfiguration {

  val config = ConfigFactory.load()

  lazy val redisHost = Try(config.getString("redis.host")).getOrElse("127.0.0.1")
  lazy val redisPort = Try(config.getInt("redis.port")).getOrElse(6379)
  lazy val redisPassword = Try(config.getString("redis.password")).getOrElse("")
  lazy val httpInterface = Try(config.getString("http.interface")).getOrElse("")
  lazy val httpPort = Try(config.getInt("http.port")).getOrElse(9090)
  lazy val bbbWebHost = Try(config.getString("services.bbbWebHost")).getOrElse("localhost")
  lazy val bbbWebPort = Try(config.getInt("services.bbbWebPort")).getOrElse(8888)
  lazy val bbbWebAPI = Try(config.getString("services.bbbWebAPI")).getOrElse("localhost")
  lazy val bbbWebSharedSecret = Try(config.getString("services.sharedSecret")).getOrElse("changeme")
  lazy val bbbWebModeratorPassword = Try(config.getString("services.moderatorPassword")).getOrElse("changeme")
  lazy val bbbWebViewerPassword = Try(config.getString("services.viewerPassword")).getOrElse("changeme")
  lazy val keysExpiresInSec = Try(config.getInt("redis.keyExpiry")).getOrElse(14 * 86400) // 14 days
  lazy val red5DeskShareIP = Try(config.getString("red5.deskshareip")).getOrElse("127.0.0.1")
  lazy val red5DeskShareApp = Try(config.getString("red5.deskshareapp")).getOrElse("")
}
