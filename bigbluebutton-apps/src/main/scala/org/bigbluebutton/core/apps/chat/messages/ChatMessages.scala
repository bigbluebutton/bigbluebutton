package org.bigbluebutton.core.apps.chat.messages

import org.bigbluebutton.core.api.InMessage
import org.bigbluebutton.core.api.IOutMessage

case class GetChatHistoryRequest(meetingID: String, requesterID: String) extends InMessage
case class SendPublicMessageRequest(meetingID: String, requesterID: String, message: Map[String, String]) extends InMessage
case class SendPrivateMessageRequest(meetingID: String, requesterID: String, message: Map[String, String]) extends InMessage

case class GetChatHistoryReply(meetingID: String, recorded: Boolean, requesterID: String, history: Array[Map[String, String]]) extends IOutMessage
case class SendPublicMessageEvent(meetingID: String, recorded: Boolean, requesterID: String, message: Map[String, String]) extends IOutMessage
case class SendPrivateMessageEvent(meetingID: String, recorded: Boolean, requesterID: String, message: Map[String, String]) extends IOutMessage
