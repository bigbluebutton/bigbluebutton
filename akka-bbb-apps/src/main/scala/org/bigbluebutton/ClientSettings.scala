package org.bigbluebutton

import org.bigbluebutton.common2.util.YamlUtil
import org.slf4j.LoggerFactory

import java.io.{ ByteArrayInputStream, File }
import scala.io.BufferedSource
import scala.util.{ Failure, Success }

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

    //Remove `:private` once it's used only by HTML5 client's internal configs
    clientSettingsFromFile -= "private"
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

  def getConfigPropertyValueByPathAsListOfStringOrElse(map: Map[String, Any], path: String, alternativeValue: List[String]): List[String] = {
    getConfigPropertyValueByPath(map, path) match {
      case Some(configValue: List[String]) => configValue
      case _ =>
        logger.debug(s"Config `$path` with type List[String] not found in clientSettings.")
        alternativeValue
    }
  }

  def getConfigPropertyValueByPathAsListOfIntOrElse(map: Map[String, Any], path: String, alternativeValue: List[Int]): List[Int] = {
    getConfigPropertyValueByPath(map, path) match {
      case Some(configValue: List[Int]) => configValue
      case _ =>
        logger.debug(s"Config `$path` with type List[Int] not found in clientSettings.")
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
          if (plugin.contains("name")) {

            val pluginName = plugin("name").toString
            val configs: Map[String, Object] = plugin
              .get("settings")
              .collect { case m: Map[_, _] =>
                m.asInstanceOf[Map[String, Object]]
              }
              .getOrElse(Map.empty[String, Object])
            pluginsFromConfig += (pluginName -> Plugin(pluginName, configs))
          }
        }
      case _ => logger.warn(s"Invalid plugins config found.")
    }

    pluginsFromConfig
  }

  def mergePluginSettingsIntoClientSettings(
      clientSettingsBeforePluginValidation: Map[String, Object],
      pluginClientSettings:                 List[Plugin]
  ): Map[String, Object] = {
    //Construct a minimal client settings structure containing only plugin overrides
    val clientSettingsOnlyPlugins: Map[String, Object] = Map[String, Object](
      "public" -> Map[String, Object](
        "plugins" -> pluginClientSettings.map(pluginSettings => Map(
          "name" -> pluginSettings.name
        ) ++ Map("settings" -> pluginSettings.settings))
      )
    )
    // Override clientSettingsBeforeValidation
    YamlUtil.mergeImmutableMaps(clientSettingsBeforePluginValidation, clientSettingsOnlyPlugins)
  }

  case class Plugin(name: String, settings: Map[String, Any])

}
