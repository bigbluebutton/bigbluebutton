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

  def updateCaptionOwnerReplyToJson(msg: UpdateCaptionOwnerReply): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.LOCALE, msg.locale)
    payload.put(Constants.LOCALE_CODE, msg.localeCode)
    payload.put(Constants.OWNER_ID, msg.ownerID)

    val header = Util.buildHeader(MessageNames.UPDATE_CAPTION_OWNER, None)
    Util.buildJson(header, payload)
  }

  def editCaptionHistoryReplyToJson(msg: EditCaptionHistoryReply): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER_ID, msg.userID)
    payload.put(Constants.START_INDEX, msg.startIndex)
    payload.put(Constants.END_INDEX, msg.endIndex)
    payload.put(Constants.LOCALE, msg.locale)
    payload.put(Constants.LOCALE_CODE, msg.localeCode)
    payload.put(Constants.TEXT, msg.text)

    val header = Util.buildHeader(MessageNames.EDIT_CAPTION_HISTORY, None)
    Util.buildJson(header, payload)
  }
}