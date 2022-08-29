package org.bigbluebutton.api

import com.google.gson.Gson
import com.softwaremill.session.{InMemoryRefreshTokenStorage, SessionConfig, SessionManager}
import org.bigbluebutton.api.enter.EnterController.gson

class ControllerStandard {
  val sessionConfig = SessionConfig.default("YzszrU1UkqsMqCNEnuLI8DDWs6Wqacj2z4dbtquSjB8GbsFpBA7GG38yk0DaIyrB")
  implicit val sessionManager = new SessionManager[Map[String,String]](sessionConfig)
  implicit val refreshTokenStorage = new InMemoryRefreshTokenStorage[Map[String,String]] {
    def log(msg: String) = println(s"Logger: $msg")
  }

  val gson = new Gson

  def toJava(m: Any): Any = {
    import java.util
    import scala.jdk.CollectionConverters._
    m match {
      case sm: Map[_, _] => sm.map(kv => (kv._1, toJava(kv._2))).asJava
      case sl: Iterable[_] => new util.ArrayList(sl.map( toJava ).asJava.asInstanceOf[util.Collection[_]])
      case _ => m
    }
  }

  def respAsJson(resp: Map[String,Any]): String = {
    gson.toJson(toJava(resp))
  }

}
