package org.bigbluebutton.core.db

import slick.jdbc.PostgresProfile.api._
import org.bigbluebutton.common2.msgs.GroupChatUser

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }

case class ChatUserDbModel(
    chatId:     String,
    meetingId:  String,
    userId:     String,
    lastSeenAt: Long
)

class ChatUserDbTableDef(tag: Tag) extends Table[ChatUserDbModel](tag, None, "chat_user") {
  val chatId = column[String]("chatId", O.PrimaryKey)
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val userId = column[String]("userId", O.PrimaryKey)
  val lastSeenAt = column[Long]("lastSeenAt")
  //  val chat = foreignKey("chat_message_chat_fk", (chatId, meetingId), ChatTable.chats)(c => (c.chatId, c.meetingId), onDelete = ForeignKeyAction.Cascade)
  //  val sender = foreignKey("chat_message_sender_fk", senderId, UserTable.users)(_.userId, onDelete = ForeignKeyAction.SetNull)

  override def * = (chatId, meetingId, userId, lastSeenAt) <> (ChatUserDbModel.tupled, ChatUserDbModel.unapply)
}

object ChatUserDAO {
  def insert(meetingId: String, chatId: String, groupChatUser: GroupChatUser) = {
    DatabaseConnection.db.run(
      TableQuery[ChatUserDbTableDef].insertOrUpdate(
        ChatUserDbModel(
          userId = groupChatUser.id,
          chatId = chatId,
          meetingId = meetingId,
          lastSeenAt = 0
        )
      )
    ).onComplete {
        case Success(rowsAffected) => println(s"$rowsAffected row(s) inserted on ChatUser table!")
        case Failure(e)            => println(s"Error inserting ChatUser: $e")
      }
  }
}