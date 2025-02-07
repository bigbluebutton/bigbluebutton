package org.bigbluebutton.core.record.events

import org.bigbluebutton.common2.util.JsonUtil

class PluginEventPersistenceRecordEvent extends AbstractPluginRecordEvent {
  import PluginEventPersistenceRecordEvent._

  setEvent("PluginGeneratedEvent")

  def setPluginEventName(eventName: String) {
    eventMap.put(PLUGIN_EVENT_NAME, eventName)
  }

  def setUserId(userId: String): Unit = {
    eventMap.put(USER_ID, userId)
  }

  def setPayloadJson(payloadJson: Map[String, Object]) {
    eventMap.put(PAYLOAD_JSON, JsonUtil.toJson(payloadJson))
  }
}

object PluginEventPersistenceRecordEvent {
  protected final val USER_ID = "userId"
  protected final val PLUGIN_EVENT_NAME = "pluginEventName"
  protected final val PLUGIN_NAME = "pluginName"
  protected final val PAYLOAD_JSON = "payloadJson"
}
