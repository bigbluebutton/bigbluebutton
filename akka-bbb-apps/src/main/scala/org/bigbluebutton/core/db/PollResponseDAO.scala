package org.bigbluebutton.core.db

import slick.jdbc.PostgresProfile.api._
import org.bigbluebutton.core.models.Poll

import scala.collection.immutable.Seq
import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }

case class PollResponseDbModel(
    pollId:   String,
    optionId: Option[Int],
    userId:   Option[String]
)

class PollResponseDbTableDef(tag: Tag) extends Table[PollResponseDbModel](tag, None, "poll_response") {
  val pollId = column[String]("pollId")
  val optionId = column[Option[Int]]("optionId")
  val userId = column[Option[String]]("userId")
  val * = (pollId, optionId, userId) <> (PollResponseDbModel.tupled, PollResponseDbModel.unapply)
}

object PollResponseDAO {
  def insert(poll: Poll, userId: String, seqOptionIds: Seq[Int]) = {

    //Clear previous responses of the user and add all
    DatabaseConnection.db.run(
      TableQuery[PollResponseDbTableDef]
        .filter(_.pollId === poll.id)
        .filter(_.userId === userId)
        .delete
    ).onComplete {
        case Success(rowsAffected) => {
          for {
            optionId <- seqOptionIds
          } yield {
            DatabaseConnection.db.run(
              TableQuery[PollResponseDbTableDef].forceInsert(
                PollResponseDbModel(
                  pollId = poll.id,
                  optionId = Some(optionId),
                  userId = {
                    if (poll.isSecret) None else Some(userId)
                  }
                )
              )
            ).onComplete {
                case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on PollResponse table!")
                case Failure(e)            => DatabaseConnection.logger.debug(s"Error inserting PollResponse: $e")
              }
          }

          //When Secret, insert the user in a different row just to inform the he answered already
          if (poll.isSecret) {
            DatabaseConnection.db.run(
              TableQuery[PollResponseDbTableDef].forceInsert(
                PollResponseDbModel(
                  pollId = poll.id,
                  optionId = None,
                  userId = Some(userId)
                )
              )
            ).onComplete {
                case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on PollResponse(secret) table!")
                case Failure(e)            => DatabaseConnection.logger.debug(s"Error inserting PollResponse(secret): $e")
              }
          }
        }
        case Failure(e) => DatabaseConnection.logger.debug(s"Error deleting poll  ${poll.id} for user ${userId}: $e")
      }
  }
}