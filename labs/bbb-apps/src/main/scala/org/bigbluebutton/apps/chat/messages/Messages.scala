package org.bigbluebutton.apps.chat.messages

import org.bigbluebutton.apps.chat.data.Text
import org.bigbluebutton.apps.Session
import org.bigbluebutton.apps.users.data.UserIdAndName
import org.bigbluebutton.apps.chat.data._

case class GetPublicChatHistory(session: Session, requester: UserIdAndName)
case class GetPublicChatHistoryResponse(session: Session,
  requester: UserIdAndName,
  messages: Seq[PublicMessage])

case class NewPrivateChatMessage(session: Session,
  from: UserIdAndName,
  font: TextFont, text: Text,
  to: UserIdAndName)

case class SendPrivateChatMessage(session: Session, message: PrivateMessage)

case class NewPublicChatMessage(session: Session,
  from: UserIdAndName,
  font: TextFont, text: Text)

case class SendPublicChatMessage(session: Session, message: PublicMessage)