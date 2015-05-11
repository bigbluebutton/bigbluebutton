package org.bigbluebutton.apps.chat

import org.bigbluebutton.apps.chat.data._
import org.bigbluebutton.apps.users.data._

object ChatApp {

}

class ChatApp {
  private var privateChats = new collection.immutable.HashMap[String, PrivateChatConversation]()
  private var publicChat = new PublicChatConversation(Seq())
  
  private var counter = 0
  
  def generateMessageId():String = {
    counter += 1
    "msg".concat(counter.toString)
  }
  
  def savePrivateChat(conv: PrivateChatConversation) = {
    privateChats += conv.id -> conv
  }
  
  def getConversionId(msg: PrivateMessage): String = {
    val from = new collection.immutable.StringOps(msg.from.id)
    val to = new collection.immutable.StringOps(msg.to.id)
    
    if (from < to) from.concat("-").concat(to) else to.concat("-").concat(from)
      
  }
  
  def newPrivateChatMessage(msg: PrivateMessage) = {
    val convId = getConversionId(msg)
    val conversation = privateChats.get(convId)
    conversation match {
      case Some(conv) => {
        val x = conv.copy(messages = (conv.messages :+ msg))
        savePrivateChat(x)
      }
      case None => {
        val chat = new PrivateChatConversation(convId, Seq())
        val x = chat.copy(messages = (chat.messages :+ msg))
        savePrivateChat(x)
      }
    }
  }
  
  def newPublicChatMessages(msg: PublicMessage) = {
     publicChat = publicChat.copy(messages = (publicChat.messages :+ msg)) 
  }
  
  def getPublicChatHistory():Array[PublicMessage] = {
    publicChat.messages.toArray
  }
}
