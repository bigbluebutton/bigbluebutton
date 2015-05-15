package org.bigbluebutton.apps.chat

import akka.actor.{ActorRef, actorRef2Scala}
import akka.event.LoggingAdapter
import org.bigbluebutton.apps.RunningMeetingActor
import org.bigbluebutton.apps.chat.messages._
import org.bigbluebutton.apps.chat.data._
import org.bigbluebutton.apps.chat.messages.SendPrivateChatMessage
import org.bigbluebutton.apps.chat.messages.SendPublicChatMessage
import org.bigbluebutton.apps.chat.messages.GetPublicChatHistory

trait ChatAppHandler {
  this : RunningMeetingActor =>
  
  val pubsub: ActorRef
  val log: LoggingAdapter
  val chatApp = new ChatApp()
  
  def handlePrivateChatMessage(msg: NewPrivateChatMessage) = {
    val msgId = chatApp.generateMessageId
    val ts = System.currentTimeMillis()
    val m = PrivateMessage(msgId, ts, msg.from, msg.to, msg.font, msg.text)
    chatApp.newPrivateChatMessage(m)
    
    pubsub ! SendPrivateChatMessage(session, m)
  }
  
  def handlePublicChatMessage(msg: NewPublicChatMessage) = {
    val msgId = chatApp.generateMessageId
    val ts = System.currentTimeMillis()
    val m = PublicMessage(msgId, ts, msg.from, msg.font, msg.text)    
    chatApp.newPublicChatMessages(m)
    
    pubsub ! SendPublicChatMessage(session, m)
  }
  
  def handleGetPublicChatHistory(msg: GetPublicChatHistory) = {
    pubsub ! GetPublicChatHistoryResponse(session, msg.requester, chatApp.getPublicChatHistory)
  }
}