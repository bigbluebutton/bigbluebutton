package org.bigbluebutton

import org.bigbluebutton.common2.util.YamlUtil
import org.slf4j.LoggerFactory

import java.io.{ ByteArrayInputStream, File }
import scala.io.BufferedSource
import scala.util.{ Failure, Success, Try }

object ClientSettings extends SystemConfiguration {
  var clientSettingsFromFile: Map[String, Object] = Map("" -> "")
  val logger = LoggerFactory.getLogger(this.getClass)

  def loadClientSettingsFromFile() = {
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

  def getClientSettingsWithOverride(clientSettingsOverrideJson: String): Map[String, Object] = {
    if (clientSettingsOverrideJson.nonEmpty) {
      val scalaMapClientOverride = common2.util.JsonUtil.toMap[Object](clientSettingsOverrideJson)
      scalaMapClientOverride match {
        case Success(clientSettingsOverrideAsMap) => YamlUtil.mergeImmutableMaps(clientSettingsFromFile, clientSettingsOverrideAsMap)
        case Failure(msg) =>
          logger.debug("No valid JSON override of client configuration in create call: {}", msg)
          clientSettingsFromFile
      }
    } else clientSettingsFromFile
  }

}
