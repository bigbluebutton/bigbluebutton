package org.bigbluebutton.core.models

import com.fasterxml.jackson.annotation.{ JsonIgnoreProperties, JsonProperty }
import com.fasterxml.jackson.core.JsonProcessingException
import com.fasterxml.jackson.databind.{ JsonMappingException, ObjectMapper }
import com.fasterxml.jackson.module.scala.DefaultScalaModule
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
  val objectMapper: ObjectMapper = new ObjectMapper()
  objectMapper.registerModule(new DefaultScalaModule())
  def getPluginByName(instance: PluginModel, pluginName: String): Option[Plugin] = {
    instance.plugins.get(pluginName)
  }
  def getPlugins(instance: PluginModel): Map[String, Plugin] = {
    instance.plugins
  }
  def replaceRelativeJavascriptEntrypoint(plugin: Plugin): Plugin = {
    val jsEntrypoint = plugin.manifest.content.javascriptEntrypointUrl
    if (jsEntrypoint.startsWith("http://") || jsEntrypoint.startsWith("https://")) {
      plugin
    } else {
      val baseUrl = plugin.manifest.url.substring(0, plugin.manifest.url.lastIndexOf('/') + 1)
      val absoluteJavascriptEntrypoint = baseUrl + jsEntrypoint
      val newPluginManifestContent = plugin.manifest.content.copy(javascriptEntrypointUrl = absoluteJavascriptEntrypoint)
      val newPluginManifest = plugin.manifest.copy(content = newPluginManifestContent)
      plugin.copy(manifest = newPluginManifest)
    }
  }
  def createPluginModelFromJson(json: util.Map[String, AnyRef]): PluginModel = {
    val instance = new PluginModel()
    var pluginsMap: Map[String, Plugin] = Map.empty[String, Plugin]
    json.forEach { case (pluginName, plugin) =>
      try {
        val pluginObject = objectMapper.readValue(objectMapper.writeValueAsString(plugin), classOf[Plugin])
        val pluginObjectWithAbsoluteJavascriptEntrypoint = replaceRelativeJavascriptEntrypoint(pluginObject)
        pluginsMap = pluginsMap + (pluginName -> pluginObjectWithAbsoluteJavascriptEntrypoint)
      } catch {
        case err @ (_: JsonProcessingException | _: JsonMappingException) => println("Error while processing plugin " +
          pluginName + ": ", err)
      }
    }
    instance.plugins = pluginsMap
    instance
  }
  def persistPluginsForClient(instance: PluginModel, meetingId: String): Unit = {
    instance.plugins.foreach { case (_, plugin) =>
      PluginDAO.insert(meetingId, plugin.manifest.content.name, plugin.manifest.content.javascriptEntrypointUrl,
        plugin.manifest.content.javascriptEntrypointIntegrity.getOrElse(""))
    }
  }
}

class PluginModel {
  private var plugins: Map[String, Plugin] = Map()
}

