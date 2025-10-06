package org.bigbluebutton.core.models

import com.fasterxml.jackson.core.JsonProcessingException
import com.fasterxml.jackson.databind.{DeserializationFeature, JsonMappingException, ObjectMapper}
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import org.bigbluebutton.ClientSettings
import org.bigbluebutton.ClientSettings.getPluginsFromConfig
import org.bigbluebutton.core.db.PluginDAO
import org.slf4j.{Logger, LoggerFactory}
import com.github.zafarkhaja.semver.Version
import org.bigbluebutton.core.exceptions.PluginHtml5VersionValidationException

import java.util

case class EventPersistence(
    isEnabled:                 Boolean,
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
    url:                    String,
    content:                Option[PluginManifestContent],
)

case class Plugin(
    manifest: PluginManifest,
    loadFailureReason: Option[String],
    loadFailureSource: Option[String]
)

object PluginModel {
  val logger: Logger = LoggerFactory.getLogger(this.getClass)
  private val objectMapper: ObjectMapper = new ObjectMapper()

  objectMapper.registerModule(new DefaultScalaModule())
  objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
  def getPluginManifestContentByName(instance: PluginModel, pluginName: String): Option[PluginManifestContent] = {
    instance.plugins.get(pluginName) match {
      case Some(p) => p.manifest.content
      case None => None
    }
  }
  def getPlugins(instance: PluginModel): Map[String, Plugin] = {
    instance.plugins
  }
  private def replaceRelativeJavascriptEntrypoint(plugin: Plugin): Plugin = {
    plugin.manifest.content match {
      case Some(pluginScalaContent) =>
        val jsEntrypoint = pluginScalaContent.javascriptEntrypointUrl
        if (!jsEntrypoint.startsWith("http://") && !jsEntrypoint.startsWith("https://")) {
          val absoluteJavascriptEntrypoint = makeAbsoluteUrl(plugin, jsEntrypoint)
          val newPluginManifestContent = pluginScalaContent.copy(javascriptEntrypointUrl = absoluteJavascriptEntrypoint)
          val newPluginManifest = plugin.manifest.copy(content = Some(newPluginManifestContent))
          return plugin.copy(manifest = newPluginManifest)
        }
    }
    plugin
  }
  private def replaceRelativeLocalesBaseUrl(plugin: Plugin): Plugin = {
    plugin.manifest.content match {
      case Some(pluginManifestContent) =>
        val localesBaseUrl = pluginManifestContent.localesBaseUrl
        localesBaseUrl match {
          case Some(value: String) =>
            if (value.startsWith("http://") || value.startsWith("https://")) {
              plugin
            } else {
              val absoluteLocalesBaseUrl = makeAbsoluteUrl(plugin = plugin, relativeUrl = value)
              val newPluginManifestContent = pluginManifestContent.copy(localesBaseUrl = Some(absoluteLocalesBaseUrl))
              val newPluginManifest = plugin.manifest.copy(content = Some(newPluginManifestContent))
              plugin.copy(manifest = newPluginManifest)
            }
          case None => plugin
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

    instance.plugins = instance.plugins.map { case (pluginName, plugin) =>
      plugin.manifest.content match {
        case Some(pluginManifest) =>
          val pluginName = pluginManifest.name
          logger.info("Validating settings for plugin {}", pluginName)
          if (pluginManifest.settingsSchema match {
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
          }) (pluginName, plugin)
          else {
            val errorMessage = s"Plugin [$pluginName] will not be loaded due to invalid setting"
            (pluginName, plugin.copy(loadFailureReason = Some(errorMessage)))
          }
        case None => (pluginName, plugin)
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
        val errorMessage = s"Unexpected error while parsing SDK versions: $e"
        logger.error(errorMessage)
        throw PluginHtml5VersionValidationException(errorMessage)

    }
  }

  private def isServerSdkCompatibleWithPlugin(html5PluginSdkVersion: String, pluginManifestRequiredSdkVersion: String): Boolean = {
    // Returns `true` if:
    // - bbb-html5 SDK version satisfies the manifest's required SDK version.
    html5SdkSatisfiesPluginRequiredVersion(html5PluginSdkVersion, pluginManifestRequiredSdkVersion)
  }

  private def createEmptyPluginWithAkkaError(errorMessage: String): Plugin = {
    Plugin(
      PluginManifest(
        "",
        None,
      ),
      Some(errorMessage),
      Some("bbb-apps-akka")
    )
  }

  def createPluginModelFromJson(pluginList: util.Map[String, AnyRef],
                                html5PluginSdkVersion: String,
                                clientSettings: Map[String, Object]): (PluginModel, List[ClientSettings.Plugin]) = {
    val instance = new PluginModel()
    var pluginsMap: Map[String, Plugin] = Map.empty[String, Plugin]
    pluginList.forEach { case (pluginName, plugin) =>
      try {
        val pluginObject = objectMapper.readValue(objectMapper.writeValueAsString(plugin), classOf[Plugin])
        if (pluginObject.loadFailureReason.isEmpty) {
          val pluginObjectWithAbsoluteUrls = replaceAllRelativeUrls(pluginObject)
          val hasMatchingVersions = isServerSdkCompatibleWithPlugin(
            html5PluginSdkVersion, pluginObjectWithAbsoluteUrls.manifest.content.get.requiredSdkVersion
          )
          if (hasMatchingVersions) {
            pluginsMap = pluginsMap + (pluginName -> pluginObjectWithAbsoluteUrls)
          } else {
            val errorMessage = s"Cannot load plugin [$pluginName]:" +
              s" system SDK version [$html5PluginSdkVersion] does not satisfy plugin" +
              s" requirement [${pluginObjectWithAbsoluteUrls.manifest.content.get.requiredSdkVersion}]."
            logger.error(errorMessage)
            pluginsMap = pluginsMap + (
              pluginName -> pluginObjectWithAbsoluteUrls.copy(
                loadFailureReason = Some(errorMessage), loadFailureSource = Some("bbb-apps-akka")
              ))
          }
        } else pluginsMap = pluginsMap + (pluginName -> Plugin(
          PluginManifest(
            pluginObject.manifest.url,
            None,
          ),
          pluginObject.loadFailureReason,
          pluginObject.loadFailureSource
        ))
      } catch {
        case err @ (_: JsonProcessingException | _: JsonMappingException) =>
          val errorMessage = s"Error while processing plugin [$pluginName]: $err"
          pluginsMap = pluginsMap + (pluginName -> createEmptyPluginWithAkkaError(errorMessage))
          logger.error(errorMessage)
        case err @ (_: NumberFormatException) =>
          val errorMessage = s"Plugin SDK version of either HTML5 or plugin manifest couldn't be parsed [$pluginName]: $err"
          pluginsMap = pluginsMap + (pluginName -> createEmptyPluginWithAkkaError(errorMessage))
          logger.error(errorMessage)
        case err @ (_: PluginHtml5VersionValidationException) =>
          val errorMessage = err.message
          pluginsMap = pluginsMap + (pluginName -> createEmptyPluginWithAkkaError(errorMessage))
        case err @ (_: Exception) =>
          val errorMessage = s"Generic exception in akka for plugin [$pluginName]: ${err.getMessage}"
          pluginsMap = pluginsMap + (pluginName -> createEmptyPluginWithAkkaError(errorMessage))
          logger.error(errorMessage, err)
      }
    }
    instance.plugins = pluginsMap
    validatePluginsBeforeCreateModel(instance, clientSettings)
  }

  def persistPluginsForClient(meetingId: String, instance: PluginModel): Unit = {
    instance.plugins.foreach { case (pluginNameRaw, plugin) =>
      val pluginName = if (plugin.manifest.url == pluginNameRaw) "unidentified-plugin" else pluginNameRaw
      plugin.manifest.content match {
        case Some(pluginManifestContent) =>
          PluginDAO.insert(meetingId, pluginName, pluginManifestContent.javascriptEntrypointUrl,
            pluginManifestContent.javascriptEntrypointIntegrity.getOrElse(""), pluginManifestContent.localesBaseUrl,
            plugin.loadFailureReason, plugin.loadFailureSource,
          )
        case None =>
          PluginDAO.insert(meetingId, pluginName, "",
            "", None, plugin.loadFailureReason, plugin.loadFailureSource
          )
      }

    }
  }
}

class PluginModel {
  private var plugins: Map[String, Plugin] = Map()
}

