package org.bigbluebutton.core.pubsub.senders

import org.bigbluebutton.common.messages.Constants
import scala.collection.mutable.HashMap
import org.bigbluebutton.core.api._
import collection.JavaConverters._
import scala.collection.JavaConversions._
import org.bigbluebutton.core.messaging.Util

object CaptionMessageToJsonConverter {
  def sendCaptionHistoryReplyToJson(msg: SendCaptionHistoryReply): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)

    payload.put(Constants.CAPTION_HISTORY, mapAsJavaMap(msg.history))

    val header = Util.buildHeader(MessageNames.SEND_CAPTION_HISTORY_REPLY, Some(msg.requesterID))
    Util.buildJson(header, payload)
  }

  def newCaptionLineEventToJson(msg: NewCaptionLineEvent): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.LINE_NUMBER, msg.lineNumber)
    payload.put(Constants.LOCALE, msg.locale)
    payload.put(Constants.START_TIME, msg.startTime)
    payload.put(Constants.TEXT, msg.text)

    val header = Util.buildHeader(MessageNames.NEW_CAPTION_LINE, None)
    Util.buildJson(header, payload)
  }
}