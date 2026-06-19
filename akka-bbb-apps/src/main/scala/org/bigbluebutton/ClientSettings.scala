package org.bigbluebutton

import org.bigbluebutton.common2.util.{ ConfigOverrideIssue, YamlUtil }
import org.slf4j.LoggerFactory

import java.io.{ ByteArrayInputStream, File }
import scala.io.BufferedSource
import scala.util.{ Failure, Success }

object ClientSettings extends SystemConfiguration {
  var clientSettingsFromFile: Map[String, Object] = Map("" -> "")
  // The pristine settings.yml catalog (with `private` still present, before any override-file
  // merge). Used as the schema that overrides are validated against - see diffOverrideAgainstBase.
  var clientSettingsCatalog: Map[String, Object] = Map.empty
  val logger = LoggerFactory.getLogger(this.getClass)

  private def readAndClose(source: scala.io.Source): String =
    try source.mkString finally source.close()

  def loadClientSettingsFromFile() = {
    val baseText = readAndClose(scala.io.Source.fromFile(clientSettingsPath, "UTF-8"))

    val clientSettingsFileOverrideToCheck = new File(clientSettingsPathOverride)
    val hasOverrideFile = clientSettingsFileOverrideToCheck.exists()

    val overrideText = readAndClose(
      if (hasOverrideFile) scala.io.Source.fromFile(clientSettingsPathOverride, "UTF-8")
      else new BufferedSource(new ByteArrayInputStream(Array[Byte]()))
    )

    val baseSettings = common2.util.YamlUtil.toMap[Object](baseText) match {
      case Success(value) => value
      case Failure(exception) =>
        logger.error("Error parsing client settings file [{}]; falling back to empty settings", clientSettingsPath, exception)
        Map[String, Object]()
    }

    val overrideParseResult = common2.util.YamlUtil.toMap[Object](overrideText)
    val overrideSettings = overrideParseResult match {
      case Success(value) => value
      case Failure(exception) =>
        logger.error("Error parsing client settings override file [{}]; falling back to empty settings", clientSettingsPathOverride, exception)
        Map[String, Object]()
    }

    // Keep the pristine catalog (settings.yml, with `private`) to validate overrides against, so a
    // malformed override file can never extend the schema and `private.*` keys stay recognized.
    clientSettingsCatalog = baseSettings

    // Validate the override file against the catalog before merging, while it still contains the
    // `private` section so overrides to `private.*` are checked too. Skip when the catalog failed
    // to load (empty) - otherwise every override key would be flagged unknown, hiding the real error.
    if (hasOverrideFile && clientSettingsCatalog.nonEmpty) {
      // A malformed override file parses to an empty map above; treat that parse failure as an
      // issue too, so strict mode refuses to boot instead of silently ignoring the whole file.
      val parseIssues = overrideParseResult.failed.toOption.toList.map { ex =>
        ConfigOverrideIssue(clientSettingsPathOverride, "invalid-yaml", Option(ex.getMessage).getOrElse(ex.toString))
      }
      val issues = parseIssues ++ YamlUtil.diffOverrideAgainstBase(clientSettingsCatalog, overrideSettings)
      val source = s"file [$clientSettingsPathOverride]"
      if (issues.nonEmpty && clientSettingsOverrideStrictValidation) {
        // Strict mode (test/staging): refuse to boot so a bad config fails the deploy loudly,
        // instead of silently applying an override the client will ignore.
        logger.error(
          "Refusing to start: client settings override {} has {} issue(s) and " +
            "clientSettingsOverrideStrictValidation is enabled:", source, issues.size.toString
        )
        issues.foreach(issue => logger.error("  - {} '{}' - {}", issue.kind, issue.path, issue.detail))
        System.exit(1)
      } else {
        logOverrideIssues(issues, source)
      }
    }

    clientSettingsFromFile = common2.util.YamlUtil.mergeImmutableMaps(baseSettings, overrideSettings)

    //Remove `:private` once it's used only by HTML5 client's internal configs
    clientSettingsFromFile -= "private"
  }

  private def logOverrideIssues(issues: List[ConfigOverrideIssue], source: String): Unit = {
    issues.foreach { issue =>
      logger.warn(
        "Client settings override {}: {} '{}' - {}; value is still applied.",
        source, issue.kind, issue.path, issue.detail
      )
    }
  }

  def getClientSettingsWithOverride(clientSettingsOverrideJson: String, meetingId: String = ""): Map[String, Object] = {
    if (clientSettingsOverrideJson.nonEmpty) {
      val scalaMapClientOverride = common2.util.JsonUtil.toMap[Object](clientSettingsOverrideJson)
      scalaMapClientOverride match {
        case Success(clientSettingsOverrideAsMap) =>
          val meetingSuffix = if (meetingId.nonEmpty) s" (meeting $meetingId)" else ""
          // Only diagnose when the catalog loaded; an empty catalog would flag every key as unknown.
          if (clientSettingsCatalog.nonEmpty) {
            logOverrideIssues(
              YamlUtil.diffOverrideAgainstBase(clientSettingsCatalog, clientSettingsOverrideAsMap),
              s"on create call$meetingSuffix"
            )
          }
          YamlUtil.mergeImmutableMaps(clientSettingsFromFile, clientSettingsOverrideAsMap)
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
