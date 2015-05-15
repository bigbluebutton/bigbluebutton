package org.bigbluebutton.apps.chat.data

import org.bigbluebutton.apps.users.data.UserIdAndName


case class Text(lang: String, text: String)	
case class TextFont(color: Int, size: Int, fontType: String)

case class Translation(lang: String, text: String)

case class PrivateMessage(id: String, timestamp: Long, from: UserIdAndName, 
                       to: UserIdAndName,
                       font: TextFont, text: Text, 
                       translations: Option[Seq[Translation]] = None)
case class PublicMessage(id: String, timestamp: Long, from: UserIdAndName, 
                       font: TextFont, text: Text, 
                       translations: Option[Seq[Translation]] = None)

case class PublicChatConversation(messages: Seq[PublicMessage]) 

case class PrivateChatConversation(id: String, messages: Seq[PrivateMessage])