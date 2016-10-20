package org.bigbluebutton.core.pubsub.senders

import org.bigbluebutton.core.api._
import org.bigbluebutton.common.messages.DeskShareStartRTMPBroadcastEventMessage
import org.bigbluebutton.common.messages.DeskShareStopRTMPBroadcastEventMessage
import org.bigbluebutton.common.messages.DeskShareNotifyViewersRTMPEventMessage
import org.bigbluebutton.common.messages.DeskShareNotifyASingleViewerEventMessage
import org.bigbluebutton.common.messages.DeskShareHangUpEventMessage

object DeskShareMessageToJsonConverter {
  def getDeskShareHangUpToJson(msg: DeskShareHangUp): String = {
    val newMsg = new DeskShareHangUpEventMessage(msg.meetingID, msg.fsConferenceName, TimestampGenerator.getCurrentTime.toString())
    newMsg.toJson()
  }

  def getDeskShareNotifyASingleViewerToJson(msg: DeskShareNotifyASingleViewer): String = {
    val newMsg = new DeskShareNotifyASingleViewerEventMessage(msg.meetingID, msg.userID,
      msg.streamPath, msg.broadcasting, msg.videoWidth, msg.videoHeight, TimestampGenerator.getCurrentTime.toString())
    newMsg.toJson()
  }

  def getDeskShareStartRTMPBroadcastToJson(msg: DeskShareStartRTMPBroadcast): String = {
    val newMsg = new DeskShareStartRTMPBroadcastEventMessage(msg.conferenceName, msg.streamPath,
      TimestampGenerator.getCurrentTime.toString())
    newMsg.toJson()
  }

  def getDeskShareStopRTMPBroadcastToJson(msg: DeskShareStopRTMPBroadcast): String = {
    val newMsg = new DeskShareStopRTMPBroadcastEventMessage(msg.conferenceName, msg.streamPath,
      TimestampGenerator.getCurrentTime.toString())
    newMsg.toJson()
  }

  def getDeskShareNotifyViewersRTMPToJson(msg: DeskShareNotifyViewersRTMP): String = {
    val newMsg = new DeskShareNotifyViewersRTMPEventMessage(msg.meetingID, msg.streamPath,
      msg.broadcasting, msg.videoWidth, msg.videoHeight, TimestampGenerator.getCurrentTime.toString())
    newMsg.toJson()
  }
}
