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

  def getConfigPropertyValueByPathAsIntOrElse(map: Map[String, Any], path: String, alternativeValue: Int): Int = {
    getConfigPropertyValueByPath(map, path) match {
      case Some(configValue: Int) => configValue
      case _ =>
        logger.debug(s"Config `$path` with type Integer not found in clientSettings.")
        alternativeValue
    }
  }

  def getConfigPropertyValueByPathAsStringOrElse(map: Map[String, Any], path: String, alternativeValue: String): String = {
    getConfigPropertyValueByPath(map, path) match {
      case Some(configValue: String) => configValue
      case _ =>
        logger.debug(s"Config `$path` with type String not found in clientSettings.")
        alternativeValue
    }
  }

  def getConfigPropertyValueByPathAsBooleanOrElse(map: Map[String, Any], path: String, alternativeValue: Boolean): Boolean = {
    getConfigPropertyValueByPath(map, path) match {
      case Some(configValue: Boolean) => configValue
      case _ =>
        logger.debug(s"Config `$path` with type Boolean found in clientSettings.")
        alternativeValue
    }
  }

  def getConfigPropertyValueByPath(map: Map[String, Any], path: String): Option[Any] = {
    val keys = path.split("\\.")

    def getRecursive(map: Map[String, Any], keys: Seq[String]): Option[Any] = {
      keys match {
        case Seq(head, tail @ _*) =>
          map.get(head) match {
            case Some(innerMap: Map[String, Any]) => getRecursive(innerMap, tail)
            case otherValue if tail.isEmpty       => otherValue
            case _                                => None
          }
        case _ => None
      }
    }

    getRecursive(map, keys)
  }

  def getPluginsFromConfig(config: Map[String, Any]): Map[String, Plugin] = {
    var pluginsFromConfig: Map[String, Plugin] = Map()

    val pluginsConfig = getConfigPropertyValueByPath(config, "public.plugins")
    pluginsConfig match {
      case Some(plugins: List[Map[String, Any]]) =>
        for {
          plugin <- plugins
        } yield {
          if (plugin.contains("name") && plugin.contains("url")) {

            val pluginName = plugin("name").toString
            val pluginUrl = plugin("url").toString
            var pluginDataChannels: Map[String, DataChannel] = Map()
            if (plugin.contains("dataChannels")) {
              plugin("dataChannels") match {
                case dataChannels: List[Map[String, Any]] =>
                  for {
                    dataChannel <- dataChannels
                  } yield {
                    if (dataChannel.contains("name")) {
                      val channelName = dataChannel("name").toString
                      val writePermission = {
                        if (dataChannel.contains("writePermission")) {
                          dataChannel("writePermission") match {
                            case wPerm: List[String] => wPerm
                            case _ => {
                              logger.warn(s"Invalid writePermission for channel $channelName in plugin $pluginName")
                              List()
                            }
                          }
                        } else {
                          logger.warn(s"Missing config writePermission for channel $channelName in plugin $pluginName")
                          List()
                        }
                      }
                      val deletePermission = {
                        if (dataChannel.contains("deletePermission")) {
                          dataChannel("deletePermission") match {
                            case dPerm: List[String] => dPerm
                            case _ => {
                              logger.warn(s"Invalid deletePermission for channel $channelName in plugin $pluginName")
                              List()
                            }
                          }
                        } else {
                          List()
                        }
                      }

                      pluginDataChannels += (channelName -> DataChannel(channelName, writePermission, deletePermission))
                    }
                  }
                case _ => logger.warn(s"Plugin $pluginName has an invalid dataChannels format")
              }
            }

            pluginsFromConfig += (pluginName -> Plugin(pluginName, pluginUrl, pluginDataChannels))
          }
        }
      case _ => logger.warn(s"Invalid plugins config found.")
    }

    pluginsFromConfig
  }

  case class DataChannel(name: String, writePermission: List[String], deletePermission: List[String])
  case class Plugin(name: String, url: String, dataChannels: Map[String, DataChannel])

}
