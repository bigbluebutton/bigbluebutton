package org.bigbluebutton.core.models

import com.fasterxml.jackson.annotation.{JsonIgnoreProperties, JsonProperty}
import com.fasterxml.jackson.core.JsonProcessingException
import com.fasterxml.jackson.databind.{JsonMappingException, ObjectMapper}
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import org.bigbluebutton.ClientSettings.{getPluginsFromConfig, logger}
import org.bigbluebutton.core.db.PluginDAO

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

case class PluginSettingTemplate(
    name: String,
    label: String,
    required: Boolean,
    settingType: String,

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
    settingsTemplate:              Option[List[PluginSettingTemplate]]  = None,
)

case class PluginManifest(
    url:     String,
    content: PluginManifestContent
)

case class Plugin(
    manifest: PluginManifest
)

object PluginModel {
  val objectMapper: ObjectMapper = new ObjectMapper()
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
  def createPluginModelFromJson(json: util.Map[String, AnyRef]): PluginModel = {
    val instance = new PluginModel()
    var pluginsMap: Map[String, Plugin] = Map.empty[String, Plugin]
    json.forEach { case (pluginName, plugin) =>
      try {
        val pluginObject = objectMapper.readValue(objectMapper.writeValueAsString(plugin), classOf[Plugin])
        val pluginObjectWithAbsoluteUrls = replaceAllRelativeUrls(pluginObject)
        pluginsMap = pluginsMap + (pluginName -> pluginObjectWithAbsoluteUrls)
      } catch {
        case err @ (_: JsonProcessingException | _: JsonMappingException) => println("Error while processing plugin " +
          pluginName + ": ", err)
      }
    }
    instance.plugins = pluginsMap
    instance
  }
  def getSettingType(settingValue: Option[Any]): String = {
    settingValue match {
      case Some(_: Int)=> "int"
      case Some(_: String) => "string"
      case Some(_: Boolean) => "boolean"
      case Some(_: Map[String, Object]) => "json"
      // Default case.
      case _ => "none"
    }
  }
  private def validatePluginsBeforePersisting(intance: PluginModel, clientSettings: Map[String, Object]) = {
    val pluginSettings = getPluginsFromConfig(clientSettings)
    intance.plugins = intance.plugins.filter(mapItem => {
      val plugin = mapItem._2
      logger.info("Validating settings for plugin {}", plugin.manifest.content.name)
      // Checking for pre-defined templates in manifest.json
      plugin.manifest.content.settingsTemplate match {
        case Some(settingsTemplateList: List[PluginSettingTemplate]) =>
          // Found template check for plugin, now fetch settings value from clientSettings.
          val pluginSettingsValues: Map[String, Object] = pluginSettings.get(plugin.manifest.content.name) match {
            case Some(settingsValues) =>
              settingsValues.settings
            case None =>
              logger.warn("Plugin {} with URL {} hasn't provided any setting", plugin.manifest.content.name, plugin.manifest.url)
              null
          }
          settingsTemplateList.forall(settingTemplate =>
            // If template setting is not required, skip it
            if (settingTemplate.required) {
              if (pluginSettingsValues != null) {
                val settingTypeFound = getSettingType(
                  pluginSettingsValues.get(settingTemplate.name))
                val settingTypeMatch = settingTemplate.settingType == settingTypeFound
                if (!settingTypeMatch) logger.error("Type mismatch in setting {} for plugin {}. Required {}, but got {}",
                  settingTemplate.name, plugin.manifest.content.name, settingTemplate.settingType, settingTypeFound)
                settingTypeMatch
              } else {
                logger.error(
                  "Plugin {} required {}, but no setting has been provided", plugin.manifest.content.name,
                  settingTemplate.name)
                false
              }
            } else true
          )
        // If no settings template is provided, no validation is needed
        case None => true
      }

    })
  }
  def persistPluginsForClient(meetingId: String, instance: PluginModel, clientSettings: Map[String, Object]): Unit = {
    validatePluginsBeforePersisting(instance, clientSettings)
    instance.plugins.foreach { case (_, plugin) =>
      PluginDAO.insert(meetingId, plugin.manifest.content.name, plugin.manifest.content.javascriptEntrypointUrl,
        plugin.manifest.content.javascriptEntrypointIntegrity.getOrElse(""), plugin.manifest.content.localesBaseUrl)
    }
  }
}

class PluginModel {
  private var plugins: Map[String, Plugin] = Map()
}

