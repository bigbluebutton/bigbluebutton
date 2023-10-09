package org.bigbluebutton

import com.typesafe.config.ConfigFactory

import java.io.{ ByteArrayInputStream, File }
import scala.io.BufferedSource
import scala.util.{ Failure, Success, Try }

object ClientSettings {
  val config = ConfigFactory.load()
  var clientSettingsFromFile: Map[String, Object] = Map("" -> "")

  def loadClientSettingsFromFile() = {
    lazy val clientSettingsPath = Try(config.getString("client.clientSettingsFilePath")).getOrElse(
      "/usr/share/meteor/bundle/programs/server/assets/app/config/settings.yml"
    )
    lazy val clientSettingsPathOverride = Try(config.getString("client.clientSettingsOverrideFilePath")).getOrElse(
      "/etc/bigbluebutton/bbb-html5.yml"
    )

    val clientSettingsFile = scala.io.Source.fromFile(clientSettingsPath, "UTF-8")

    val clientSettingsFileOverrideToCheck = new File(clientSettingsPathOverride)

    val clientSettingsFileOverride = if (clientSettingsFileOverrideToCheck.exists())
      scala.io.Source.fromFile(
        clientSettingsPathOverride,
        "UTF-8"
      )
    else new BufferedSource(new ByteArrayInputStream(Array[Byte]()))

    clientSettingsFromFile =
      common2.util.YamlUtil.mergeImmutableMaps(
        common2.util.YamlUtil.toMap[Object](clientSettingsFile.mkString) match {
          case Success(value) => value
          case Failure(exception) =>
            println("Error while fetching client Settings: ", exception)
            Map[String, Object]()
        },
        common2.util.YamlUtil.toMap[Object](clientSettingsFileOverride.mkString) match {
          case Success(value) => value
          case Failure(exception) =>
            println("Error while fetching client override Settings: ", exception)
            Map[String, Object]()
        }
      )
  }
}
