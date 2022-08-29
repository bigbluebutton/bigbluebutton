package org.bigbluebutton.service
import com.typesafe.config.ConfigFactory
import scala.util.Try

case class ParamsUtils(meetingId: String = "", params: Map[String, String] = Map()) {
  val config = ConfigFactory.load("bigbluebutton.properties").resolve()

  def hasParam(apiName: String): Boolean = {
    params.getOrElse(apiName, "") match {
      case "" => false
      case _  => true
    }
  }

  def getConfigAsString(configName: String = "", defaultValue: String = ""): String = {
    var configValue = Try(config.getString(configName)).getOrElse(defaultValue)
    val pattern = """\$\{([^\}]+)\}""".r
    val allMatches = pattern.findAllMatchIn(configValue)
    allMatches.foreach { m =>
      configValue = configValue.replace(m.group(0), getConfigAsString(m.group(1)))
    }

    configValue
  }

  def getParamAsString(apiName: String, configName: String = "", defaultValue: String = ""): String = {
    val value = params.getOrElse(apiName, {
      if (configName equals "") defaultValue
      else getConfigAsString(configName,defaultValue)
    })

    value
  }

  def getParamAsInt(apiName: String, configName: String, defaultValue: Int): Int = {
    val value = getParamAsString(apiName, configName, "")

    if (value == "") defaultValue
    else value.toInt
  }

  def getParamAsBoolean(apiName: String, configName: String = "", defaultValue: Boolean): Boolean = {
    val value = getParamAsString(apiName, configName, "")

    value.toLowerCase match {
      case "true"  => true
      case "false" => true
      case ""      => defaultValue
      case _ => {
        println(s"Invalid param [$apiName] for meeting=[$meetingId]")
        defaultValue
      }
    }
  }
}
