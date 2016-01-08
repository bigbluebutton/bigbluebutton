package org.bigbluebutton.core.pubsub.senders

import org.bigbluebutton.core.api._
import org.bigbluebutton.common.messages.DeskShareStartRecordingEventMessage
import org.bigbluebutton.common.messages.DeskShareStopRecordingEventMessage
import org.bigbluebutton.common.messages.DeskShareStartRTMPBroadcastEventMessage
import org.bigbluebutton.common.messages.DeskShareStopRTMPBroadcastEventMessage
import org.bigbluebutton.common.messages.DeskShareNotifyViewersRTMPEventMessage
import org.bigbluebutton.common.messages.DeskShareNotifyASingleViewerEventMessage
import org.bigbluebutton.common.messages.DeskShareHangUpEventMessage

object DeskShareMessageToJsonConverter {
  def getDeskShareHangUpToJson(msg: DeskShareHangUp): String = {
    println("^^^^^getDeskShareHangUpToJson in DeskShareMessageToJsonConverter")
    val newMsg = new DeskShareHangUpEventMessage(msg.meetingID, msg.fsConferenceName, TimestampGenerator.getCurrentTime.toString())
    newMsg.toJson()
  }

  def getDeskShareNotifyASingleViewerToJson(msg: DeskShareNotifyASingleViewer): String = {
    println("^^^^^getDeskShareNotifyASingleViewerToJson in DeskShareMessageToJsonConverter")
    val newMsg = new DeskShareNotifyASingleViewerEventMessage(msg.meetingID, msg.userID,
      msg.streamPath, msg.broadcasting, msg.videoWidth, msg.videoHeight, TimestampGenerator.getCurrentTime.toString())
    newMsg.toJson()
  }

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
    val newMsg = new DeskShareStartRTMPBroadcastEventMessage(msg.conferenceName, msg.streamPath,
      msg.timestamp)
    newMsg.toJson()
  }

  def getDeskShareStopRTMPBroadcastToJson(msg: DeskShareStopRTMPBroadcast): String = {
    println("^^^^^getDeskShareStopRTMPBroadcastToJson in DeskShareMessageToJsonConverter")
    val newMsg = new DeskShareStopRTMPBroadcastEventMessage(msg.conferenceName, msg.streamPath,
      msg.timestamp)
    newMsg.toJson()
  }

  def getDeskShareNotifyViewersRTMPToJson(msg: DeskShareNotifyViewersRTMP): String = {
    println("^^^^^getDeskShareNotifyViewersRTMPToJson in DeskShareMessageToJsonConverter")
    val newMsg = new DeskShareNotifyViewersRTMPEventMessage(msg.meetingID, msg.streamPath,
      msg.broadcasting, msg.videoWidth, msg.videoHeight, msg.timestamp)
    newMsg.toJson()
  }
}
