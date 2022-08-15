package org.bigbluebutton

import com.typesafe.config.{Config, ConfigFactory}

object Settings {
  private val app: Config = ConfigFactory.load().getConfig("application")

  object Http {
    private val http: Config = app.getConfig("http")
    val host: String = http.getString("host")
    val port: Int = sys.env.getOrElse("PORT", http.getString("port")).toInt
  }

}
