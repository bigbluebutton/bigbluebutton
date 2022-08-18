package org.bigbluebutton.api

import com.google.gson.Gson
import com.softwaremill.session.{InMemoryRefreshTokenStorage, SessionConfig, SessionManager}
import spray.json.{JsArray, JsFalse, JsNumber, JsObject, JsString, JsTrue, JsValue, JsonFormat, enrichAny}
import spray.json._

class ControllerStandard {


  val sessionConfig = SessionConfig.default("YzszrU1UkqsMqCNEnuLI8DDWs6Wqacj2z4dbtquSjB8GbsFpBA7GG38yk0DaIyrB")
  implicit val sessionManager = new SessionManager[Map[String,String]](sessionConfig)
  implicit val refreshTokenStorage = new InMemoryRefreshTokenStorage[Map[String,String]] {
    def log(msg: String) = println(s"Logger: $msg")
  }





//  def mapToJson(mapToConvert: Map[String,Any]) {
//    mapToConvert.toJson.prettyPrint
//  }

  val gson = new Gson

}
