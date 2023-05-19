package org.bigbluebutton.core.db

import slick.jdbc.PostgresProfile.api._
//import org.bigbluebutton.core.models.GroupPollUser

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }

case class PollUserDbModel(
    pollId: String,
    userId: String
)

class PollUserDbTableDef(tag: Tag) extends Table[PollUserDbModel](tag, None, "poll_user") {
  val pollId = column[String]("pollId", O.PrimaryKey)
  val userId = column[String]("userId", O.PrimaryKey)
  //  val pk = primaryKey("poll_user_pkey", (pollId, userId))
  val * = (pollId, userId) <> (PollUserDbModel.tupled, PollUserDbModel.unapply)
}
//
//object PollUserDAO {
//  def insert(meetingId: String, chatId: String, groupPollUser: GroupPollUser) = {
//    DatabaseConnection.db.run(
//      TableQuery[PollUserDbTableDef].insertOrUpdate(
//        PollUserDbModel(
//          messageId = groupPollUser.id,
//          chatId = chatId,
//          meetingId = meetingId,
//          correlationId = groupPollUser.correlationId,
//          createdTime = groupPollUser.timestamp,
//          chatEmphasizedText = groupPollUser.chatEmphasizedText,
//          message = groupPollUser.message,
//          senderId = groupPollUser.sender.id,
//          senderName = groupPollUser.sender.name,
//          senderRole = groupPollUser.sender.role,
//        )
//      )
//    ).onComplete {
//        case Success(rowsAffected) => {
//          DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on PollUser table!")
//
//          //Set chat visible for all participant users
//          ChatUserDAO.updateChatVisible(meetingId, chatId)
//        }
//        case Failure(e)            => DatabaseConnection.logger.debug(s"Error inserting PollUser: $e")
//      }
//  }
//}