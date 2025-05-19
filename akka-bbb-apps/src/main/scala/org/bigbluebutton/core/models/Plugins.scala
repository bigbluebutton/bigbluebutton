package org.bigbluebutton.core.models

import com.fasterxml.jackson.core.JsonProcessingException
import com.fasterxml.jackson.databind.{ JsonMappingException, ObjectMapper }
import com.fasterxml.jackson.module.scala.DefaultScalaModule
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

case class PluginManifestContent(
    requiredSdkVersion:            String,
    name:                          String,
    javascriptEntrypointUrl:       String,
    enabledForBreakoutRooms:       Boolean                        = false,
    javascriptEntrypointIntegrity: Option[String]                 = None,
    localesBaseUrl:                Option[String]                 = None,
    eventPersistence:              Option[EventPersistence]       = None,
    dataChannels:                  Option[List[DataChannel]]      = None,
    remoteDataSources:             Option[List[RemoteDataSource]] = None
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

  private def checkPluginSdkVersionDevMode(pluginSdkVersion: String): Boolean =
    pluginSdkVersion.startsWith("http://codeload")

  private def html5SdkSatisfiesPluginRequiredVersion(bbbHtml5SdkVersion: String, pluginHtml5SdkRequirement: String): Boolean = {
    try {
      val v = Version.valueOf(bbbHtml5SdkVersion)
      v.satisfies(pluginHtml5SdkRequirement)
    } catch {
      case e: Exception =>
        logger.error(s"Unexpected error while parsing SDK versions: $e")
        false
    }
  }

  private def isServerSdkCompatibleWithPlugin(html5PluginSdkVersion: String, pluginManifestRequiredSdkVersion: String): Boolean = {
    // Returns `true` if:
    // - Both versions are URLs starting with "http://codeload" (development mode).
    // - OR the manifest plugin-sdk version is less than or equal to the HTML plugin-sdk version.
    (checkPluginSdkVersionDevMode(html5PluginSdkVersion) && checkPluginSdkVersionDevMode(pluginManifestRequiredSdkVersion)) ||
      html5SdkSatisfiesPluginRequiredVersion(html5PluginSdkVersion, pluginManifestRequiredSdkVersion)
  }

  def createPluginModelFromJson(json: util.Map[String, AnyRef], html5PluginSdkVersion: String): PluginModel = {
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
    instance
  }
  def persistPluginsForClient(instance: PluginModel, meetingId: String): Unit = {
    instance.plugins.foreach { case (_, plugin) =>
      PluginDAO.insert(meetingId, plugin.manifest.content.name, plugin.manifest.content.javascriptEntrypointUrl,
        plugin.manifest.content.javascriptEntrypointIntegrity.getOrElse(""), plugin.manifest.content.localesBaseUrl)
    }
  }
}

class PluginModel {
  private var plugins: Map[String, Plugin] = Map()
}

