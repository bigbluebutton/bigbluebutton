package org.bigbluebutton.api

import com.google.gson.Gson
import com.softwaremill.session.{InMemoryRefreshTokenStorage, SessionConfig, SessionManager}

class ControllerStandard {
  val sessionConfig = SessionConfig.default("YzszrU1UkqsMqCNEnuLI8DDWs6Wqacj2z4dbtquSjB8GbsFpBA7GG38yk0DaIyrB")
  implicit val sessionManager = new SessionManager[Map[String,String]](sessionConfig)
  implicit val refreshTokenStorage = new InMemoryRefreshTokenStorage[Map[String,String]] {
    def log(msg: String) = println(s"Logger: $msg")
  }

  val gson = new Gson

}
