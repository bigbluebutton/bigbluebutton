package org.bigbluebutton.core.models

import com.fasterxml.jackson.core.JsonProcessingException
import com.fasterxml.jackson.databind.{JsonMappingException, ObjectMapper}
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import org.bigbluebutton.ClientSettings
import org.bigbluebutton.ClientSettings.getPluginsFromConfig
import org.bigbluebutton.core.db.PluginDAO
import org.slf4j.LoggerFactory
import com.github.zafarkhaja.semver.Version

import java.util

case class RateLimiting(
    messagesAllowedPerSecond: Int,
    messagesAllowedPerMinute: Int
)

case class EventPersistence(
    isEnabled:                 Boolean,
    maximumPayloadSizeInBytes: Int,
    rateLimiting:              RateLimiting
)

case class DataChannel(
    name:                      String,
    pushPermission:            List[String],
    replaceOrDeletePermission: List[String]
)

case class RemoteDataSource(
    name:        String,
    url:         String,
    fetchMode:   String,
    permissions: List[String]
)

case class PluginSettingSchema(
    name: String,
    `type`: String,
    required: Boolean            = false,
    defaultValue: Option[Any]    = None,
    label:        Option[String] = None
)

case class PluginManifestContent(
    requiredSdkVersion:            String,
    name:                          String,
    javascriptEntrypointUrl:       String,
    enabledForBreakoutRooms:       Boolean                              = false,
    javascriptEntrypointIntegrity: Option[String]                       = None,
    localesBaseUrl:                Option[String]                       = None,
    eventPersistence:              Option[EventPersistence]             = None,
    dataChannels:                  Option[List[DataChannel]]            = None,
    remoteDataSources:             Option[List[RemoteDataSource]]       = None,
    settingsSchema:                Option[List[PluginSettingSchema]]    = None,
)

case class PluginManifest(
    url:     String,
    content: PluginManifestContent
)

case class Plugin(
    manifest: PluginManifest
)

object PluginModel {
  val logger = LoggerFactory.getLogger(this.getClass)
  private val objectMapper: ObjectMapper = new ObjectMapper()

  objectMapper.registerModule(new DefaultScalaModule())
  def getPluginByName(instance: PluginModel, pluginName: String): Option[Plugin] = {
    instance.plugins.get(pluginName)
  }
  def getPlugins(instance: PluginModel): Map[String, Plugin] = {
    instance.plugins
  }
  private def replaceRelativeJavascriptEntrypoint(plugin: Plugin): Plugin = {
    val jsEntrypoint = plugin.manifest.content.javascriptEntrypointUrl
    if (jsEntrypoint.startsWith("http://") || jsEntrypoint.startsWith("https://")) {
      plugin
    } else {
      val absoluteJavascriptEntrypoint = makeAbsoluteUrl(plugin, jsEntrypoint)
      val newPluginManifestContent = plugin.manifest.content.copy(javascriptEntrypointUrl = absoluteJavascriptEntrypoint)
      val newPluginManifest = plugin.manifest.copy(content = newPluginManifestContent)
      plugin.copy(manifest = newPluginManifest)
    }
  }
  private def replaceRelativeLocalesBaseUrl(plugin: Plugin): Plugin = {
    val localesBaseUrl = plugin.manifest.content.localesBaseUrl
    localesBaseUrl match {
      case Some(value: String) =>
        if (value.startsWith("http://") || value.startsWith("https://")) {
          plugin
        } else {
          val absoluteLocalesBaseUrl = makeAbsoluteUrl(plugin = plugin, relativeUrl = value)
          val newPluginManifestContent = plugin.manifest.content.copy(localesBaseUrl = Some(absoluteLocalesBaseUrl))
          val newPluginManifest = plugin.manifest.copy(content = newPluginManifestContent)
          plugin.copy(manifest = newPluginManifest)
        }
      case None => plugin
    }
  }
  private def makeAbsoluteUrl(plugin: Plugin, relativeUrl: String): String = {
    val baseUrl = plugin.manifest.url.substring(0, plugin.manifest.url.lastIndexOf('/') + 1)
    baseUrl + relativeUrl
  }
  private def replaceAllRelativeUrls(plugin: Plugin): Plugin = {
    val pluginWithAbsoluteJsEntrypoint = replaceRelativeJavascriptEntrypoint(plugin)
    replaceRelativeLocalesBaseUrl(pluginWithAbsoluteJsEntrypoint)
  }

  private def getSettingType(settingValue: Option[Any]): String = {
    settingValue match {
      case Some(_: Int)=> "int"
      case Some(_: Float)=> "float"
      case Some(_: String) => "string"
      case Some(_: Boolean) => "boolean"
      case Some(_: Map[String, Object]) => "json"
      // Default case.
      case _ => "none"
    }
  }



  private def addPluginSettingEntry(currentPluginSettings: Map[String, ClientSettings.Plugin],
                                      pluginName: String, settingKey: String, settingValue: Any): Map[String, ClientSettings.Plugin]= {
    val updatedPluginSetting: Map[String, ClientSettings.Plugin] = currentPluginSettings.get(pluginName) match {
      // Plugin exists: add setting in its existing settings map
      case Some(
        pluginSettings: ClientSettings.Plugin
      ) => Map(pluginName -> ClientSettings.Plugin(pluginName, pluginSettings.settings + (settingKey -> settingValue)))
      // Plugin not found: create a new plugin entry with the given setting
      case None => Map(pluginName -> ClientSettings.Plugin(pluginName, Map(settingKey -> settingValue)))
    }
    currentPluginSettings ++ updatedPluginSetting
  }

  private def validateAndApplySettingHelper(
                                             pluginSettingsMap: Map[String, ClientSettings.Plugin],
                                             pluginName: String,
                                             settingSchemaEntry: PluginSettingSchema
                                     ): (Boolean, Map[String, ClientSettings.Plugin]) = {
    // Get plugin settings values - Option[Object]
    val settingValueOpt = pluginSettingsMap.get(pluginName).flatMap(_.settings.get(settingSchemaEntry.name))
    val valueIsCorrectType = getSettingType(settingValueOpt) == settingSchemaEntry.`type`

    settingValueOpt match {
      case Some(value) =>
        if (!valueIsCorrectType) {
          logger.error("Plugin [{}]: Setting [{}] has a value [{}] of incorrect type. Expected [{}]. Plugin will not be loaded.",
            pluginName, settingSchemaEntry.name, value, settingSchemaEntry.`type`)
        }
        (valueIsCorrectType, pluginSettingsMap)

      case None =>
        val defaultSettingType = getSettingType(settingSchemaEntry.defaultValue)
        val defaultValid = defaultSettingType == settingSchemaEntry.`type`
        if (defaultValid) {
          val settingsDefaultValue = settingSchemaEntry.defaultValue.get
          logger.warn("Plugin [{}]: Required setting [{}] not found. Falling back to default value [{}]",
            pluginName, settingSchemaEntry.name, settingSchemaEntry.defaultValue)

          val updatedPluginSettingMap = addPluginSettingEntry(pluginSettingsMap, pluginName, settingSchemaEntry.name,
            settingsDefaultValue)
          (true, updatedPluginSettingMap)
        } else {
          logger.error("Plugin [{}]: Required setting [{}] is missing and default value [{}] of type [{}] does not match expected type [{}]",
            pluginName, settingSchemaEntry.name, settingSchemaEntry.defaultValue, defaultSettingType, settingSchemaEntry.`type`)
          (false, pluginSettingsMap)
        }
    }
  }

  private def validatePluginsBeforeCreateModel(
                                                instance: PluginModel,
                                                clientSettings: Map[String, Object]
                                              ): (PluginModel, List[ClientSettings.Plugin]) = {

    var pluginSettings = getPluginsFromConfig(clientSettings)

    instance.plugins = instance.plugins.filter { case (_, plugin) =>
      val pluginName = plugin.manifest.content.name
      logger.info("Validating settings for plugin {}", pluginName)

      plugin.manifest.content.settingsSchema match {
        case Some(schemaList) =>
          schemaList.forall { settingSchemaEntry =>
            if (!settingSchemaEntry.required) true
            else {
              val (settingValid, updatedPluginSettingMap) = validateAndApplySettingHelper(
                pluginSettings, pluginName, settingSchemaEntry)
              pluginSettings = updatedPluginSettingMap
              if (!settingValid) logger.warn("Plugin [{}] will be skipped due to invalid setting [{}]",
                pluginName, settingSchemaEntry.name)
              settingValid
            }
          }
        case None => true
      }
    }

    (instance, pluginSettings.values.toList)
  }

  private def html5SdkSatisfiesPluginRequiredVersion(bbbHtml5SdkVersion: String, pluginHtml5SdkRequirement: String): Boolean = {
    try {
      val v = Version.parse(bbbHtml5SdkVersion)
      v.satisfies(pluginHtml5SdkRequirement)
    } catch {
      case e: Exception =>
        logger.error(s"Unexpected error while parsing SDK versions: $e")
        false
    }
  }

  private def isServerSdkCompatibleWithPlugin(html5PluginSdkVersion: String, pluginManifestRequiredSdkVersion: String): Boolean = {
    // Returns `true` if:
    // - bbb-html5 SDK version satisfies the manifest's required SDK version.
    html5SdkSatisfiesPluginRequiredVersion(html5PluginSdkVersion, pluginManifestRequiredSdkVersion)
  }

    def createPluginModelFromJson(json: util.Map[String, AnyRef],
                                   html5PluginSdkVersion: String,
                                   clientSettings: Map[String, Object]): (PluginModel, List[ClientSettings.Plugin]) = {
    val instance = new PluginModel()
    var pluginsMap: Map[String, Plugin] = Map.empty[String, Plugin]
    json.forEach { case (pluginName, plugin) =>
      try {
        val pluginObject = objectMapper.readValue(objectMapper.writeValueAsString(plugin), classOf[Plugin])
        val pluginObjectWithAbsoluteUrls = replaceAllRelativeUrls(pluginObject)
        val hasMatchingVersions = isServerSdkCompatibleWithPlugin(
          html5PluginSdkVersion, pluginObjectWithAbsoluteUrls.manifest.content.requiredSdkVersion
        )
        if (hasMatchingVersions) {
          pluginsMap = pluginsMap + (pluginName -> pluginObjectWithAbsoluteUrls)
        } else {
          logger.error(
            s"Cannot load plugin {}: system SDK version '{}' does not satisfy plugin requirement '{}'.",
            pluginName,
            html5PluginSdkVersion,
            pluginObjectWithAbsoluteUrls.manifest.content.requiredSdkVersion
          )
        }
      } catch {
        case err @ (_: JsonProcessingException | _: JsonMappingException) => logger.error(
          s"Error while processing plugin $pluginName: $err"
        )
        case err @ (_: NumberFormatException) => logger.error(
          s"Plugin SDK version of either HTML5 or plugin manifest couldn't be parsed ($pluginName): $err"
        )
      }
    }
    instance.plugins = pluginsMap
    validatePluginsBeforeCreateModel(instance, clientSettings)
  }
  def persistPluginsForClient(meetingId: String, instance: PluginModel): Unit = {
    instance.plugins.foreach { case (_, plugin) =>
      PluginDAO.insert(meetingId, plugin.manifest.content.name, plugin.manifest.content.javascriptEntrypointUrl,
        plugin.manifest.content.javascriptEntrypointIntegrity.getOrElse(""), plugin.manifest.content.localesBaseUrl)
    }
  }
}

class PluginModel {
  private var plugins: Map[String, Plugin] = Map()
}

