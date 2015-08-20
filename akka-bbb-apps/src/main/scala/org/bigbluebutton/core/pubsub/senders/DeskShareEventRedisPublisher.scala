package org.bigbluebutton.core.pubsub.senders

import org.bigbluebutton.core.api.OutMessageListener2
import org.bigbluebutton.core.MessageSender
import org.bigbluebutton.core.api._
import com.google.gson.Gson
import scala.collection.mutable.HashMap
import collection.JavaConverters._
import scala.collection.JavaConversions._
import java.util.ArrayList
import org.bigbluebutton.common.messages.MessagingConstants
import org.bigbluebutton.core.messaging.Util

class DeskShareEventRedisPublisher(service: MessageSender) extends OutMessageListener2 {
  def handleMessage(msg: IOutMessage) {
    msg match {
      case msg: DeskShareStartRecording => handleDeskShareStartRecording(msg)
      case msg: DeskShareStopRecording => handleDeskShareStopRecording(msg)
      case msg: DeskShareStartRTMPBroadcast => handleDeskShareStartRTMPBroadcast(msg)
      case msg: DeskShareStopRTMPBroadcast => handleDeskShareStopRTMPBroadcast(msg)
      case msg: DeskShareNotifyViewersRTMP => handleDeskShareNotifyViewersRTMP(msg)
      case _ => // do nothing
    }
  }

  private def handleDeskShareStartRecording(msg: DeskShareStartRecording) {
    println("_____publish to FS__handleDeskShareStartRecording____________")
    val json = DeskShareMessageToJsonConverter.getDeskShareStartRecordingToJson(msg)
    service.send(MessagingConstants.TO_VOICE_CONF_SYSTEM_CHAN, json)
  }

  private def handleDeskShareStopRecording(msg: DeskShareStopRecording) {
    println("_____publish to FS__handleDeskShareStopRecording____________")
    val json = DeskShareMessageToJsonConverter.getDeskShareStopRecordingToJson(msg)
    service.send(MessagingConstants.TO_VOICE_CONF_SYSTEM_CHAN, json)
  }

  private def handleDeskShareStartRTMPBroadcast(msg: DeskShareStartRTMPBroadcast) {
    println("_____publish to FS__handleDeskShareStartRTMPBroadcast____________")
    val json = DeskShareMessageToJsonConverter.getDeskShareStartRTMPBroadcastToJson(msg)
    service.send(MessagingConstants.TO_VOICE_CONF_SYSTEM_CHAN, json)
  }

  private def handleDeskShareStopRTMPBroadcast(msg: DeskShareStopRTMPBroadcast) {
    println("_____publish to FS__handleDeskShareStopRTMPBroadcast____________")
    val json = DeskShareMessageToJsonConverter.getDeskShareStopRTMPBroadcastToJson(msg)
    service.send(MessagingConstants.TO_VOICE_CONF_SYSTEM_CHAN, json)
  }

  private def handleDeskShareNotifyViewersRTMP(msg: DeskShareNotifyViewersRTMP) {
    println("_____publish to bigbluebutton-apps(red5) __handleDeskShareNotifyViewersRTMP____________")
    val json = DeskShareMessageToJsonConverter.getDeskShareNotifyViewersRTMPToJson(msg)
    service.send(MessagingConstants.FROM_DESK_SHARE_CHANNEL, json)
  }
}
