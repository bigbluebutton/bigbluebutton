package org.bigbluebutton.core.pubsub.senders

import org.bigbluebutton.core.api._
import org.bigbluebutton.common.messages.DeskShareStartRecordingEventMessage
import org.bigbluebutton.common.messages.DeskShareStopRecordingEventMessage
import org.bigbluebutton.common.messages.DeskShareStartRTMPBroadcastEventMessage

object DeskShareMessageToJsonConverter {

  val UNKNOWN = "unknown"

  def getDeskShareStartRecordingToJson(msg: DeskShareStartRecording): String = {
    println("^^^^^getDeskShareStartRecordingToJson in DeskShareMessageToJsonConverter")
    val newMsg = new DeskShareStartRecordingEventMessage(msg.conferenceName, msg.filename, msg.timestamp)
    newMsg.toJson()
  }

  def getDeskShareStopRecordingToJson(msg: DeskShareStopRecording): String = {
    println("^^^^^getDeskShareStopRecordingToJson in DeskShareMessageToJsonConverter")
    val newMsg = new DeskShareStopRecordingEventMessage(msg.conferenceName, msg.filename, msg.timestamp)
    newMsg.toJson()
  }

  def getDeskShareStartRTMPBroadcastToJson(msg: DeskShareStartRTMPBroadcast): String = {
    println("^^^^^getDeskShareStartRTMPBroadcastToJson in DeskShareMessageToJsonConverter")
    val newMsg = new DeskShareStartRTMPBroadcastEventMessage(msg.conferenceName, msg.streamPath, msg.timestamp)
    newMsg.toJson()
  }
}
