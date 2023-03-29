package org.bigbluebutton.core.db

import slick.jdbc.PostgresProfile.api._
import org.bigbluebutton.core.models.GroupChat

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }

case class ChatDbModel(
    chatId:       String,
    meetingId:    String,
    access:       String,
    createdBy:    String,
//    participants: List[String],
//    users:        List[String]
)

class ChatDbTableDef(tag: Tag) extends Table[ChatDbModel](tag, None, "chat") {
  val chatId = column[String]("chatId", O.PrimaryKey)
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val access = column[String]("access")
  val createdBy = column[String]("createdBy")
//  val participants = column[List[String]]("participants")
//  val users = column[List[String]]("users")
  //  val meeting = foreignKey("chat_meeting_fk", (meetingId), ChatDbTableDef.meetings)(_.meetingId, onDelete = ForeignKeyAction.Cascade)
  override def * = (chatId, meetingId, access, createdBy) <> (ChatDbModel.tupled, ChatDbModel.unapply)
}

object ChatDAO {
  def insert(meetingId: String, groupChat: GroupChat) = {
    DatabaseConnection.db.run(
      TableQuery[ChatDbTableDef].insertOrUpdate(
        ChatDbModel(
          chatId = groupChat.id,
          meetingId = meetingId,
          access = groupChat.access,
          createdBy = groupChat.createdBy.id,
//          participants = groupChat.users.map(u => u.id).toList,
//          users = groupChat.users.map(u => u.id).toList
        )
      )
    ).onComplete {
        case Success(rowsAffected) => {
          println(s"$rowsAffected row(s) inserted on Chat table!")

          for {
            user <- groupChat.users
          } yield {
            ChatUserDAO.insert(meetingId, groupChat.id, user)
          }

        }
        case Failure(e)            => println(s"Error inserting Chat: $e")
      }
  }
}