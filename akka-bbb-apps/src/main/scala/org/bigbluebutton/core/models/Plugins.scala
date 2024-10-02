package org.bigbluebutton.core.models

import org.bigbluebutton.common2.util.JsonUtil
import org.bigbluebutton.core.db.PluginDAO

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
    requiredSdkVersion:      String,
    name:                    String,
    javascriptEntrypointUrl: String,
    localesBaseUrl:          String,
    eventPersistence:        EventPersistence,
    dataChannels:            List[DataChannel],
    remoteDataSources:       List[RemoteDataSource]
)

case class PluginManifest(
    url:     String,
    content: PluginManifestContent
)

case class Plugin(
    manifest: PluginManifest
)

object PluginModel {
  def getPluginByName(instance: PluginModel, pluginName: String): Option[Plugin] = {
    instance.plugins.get(pluginName)
  }
  def getPlugins(instance: PluginModel): Map[String, Plugin] = {
    instance.plugins
  }
  def createPluginModelFromJson(jsonString: String): PluginModel = {
    val instance = new PluginModel()
    instance.plugins = JsonUtil.fromJson[Map[String, Plugin]](jsonString).getOrElse(Map())
    instance
  }
  def persistPluginsForClient(instance: PluginModel, meetingId: String): Unit = {
    instance.plugins.foreach { case (_, plugin) =>
      PluginDAO.insert(meetingId, plugin.manifest.content.name, plugin.manifest.content.javascriptEntrypointUrl)
    }
  }
}

class PluginModel {
  private var plugins: Map[String, Plugin] = Map()
}

