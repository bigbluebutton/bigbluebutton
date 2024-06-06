package org.bigbluebutton.core.db

import org.bigbluebutton.common2.domain.SimplePollResultOutVO
import org.bigbluebutton.core.models.Poll
import slick.jdbc.PostgresProfile.api._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }

case class PollDbModel(
    pollId:            String,
    meetingId:         String,
    ownerId:           String,
    questionText:      String,
    pollType:          String,
    secret:            Boolean,
    multipleResponses: Boolean,
    ended:             Boolean,
    published:         Boolean,
    publishedAt:       Option[java.sql.Timestamp]
)

class PollDbTableDef(tag: Tag) extends Table[PollDbModel](tag, None, "poll") {
  val pollId = column[String]("pollId", O.PrimaryKey)
  val meetingId = column[String]("meetingId")
  val ownerId = column[String]("ownerId")
  val questionText = column[String]("questionText")
  val pollType = column[String]("type")
  val secret = column[Boolean]("secret")
  val multipleResponses = column[Boolean]("multipleResponses")
  val ended = column[Boolean]("ended")
  val published = column[Boolean]("published")
  val publishedAt = column[Option[java.sql.Timestamp]]("publishedAt")
  val * = (pollId, meetingId, ownerId, questionText, pollType, secret, multipleResponses, ended, published, publishedAt) <> (PollDbModel.tupled, PollDbModel.unapply)
}

object PollDAO {
  def insert(meetingId: String, ownerId: String, poll: Poll) = {
    for {
      question <- poll.questions
    } yield {
      DatabaseConnection.db.run(
        TableQuery[PollDbTableDef].insertOrUpdate(
          PollDbModel(
            pollId = poll.id,
            meetingId = meetingId,
            ownerId = ownerId,
            questionText = question.text.getOrElse(""),
            pollType = question.questionType,
            secret = poll.isSecret,
            multipleResponses = question.multiResponse,
            ended = false,
            published = false,
            publishedAt = None
          )
        )
      ).onComplete {
          case Success(rowsAffected) => {
            DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on Poll table!")

            DatabaseConnection.db.run(DBIO.sequence(
              for {
                answer <- question.answers.toList
              } yield {
                PollOptionDAO.prepareOptionInsert(poll.id, answer)
              }
            ).transactionally)
              .onComplete {
                case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on PollOption table!")
                case Failure(e)            => DatabaseConnection.logger.error(s"Error inserting PollOption: $e")
              }
          }
          case Failure(e) => DatabaseConnection.logger.debug(s"Error inserting Poll: $e")
        }
    }
  }

  def updateOptions(poll: SimplePollResultOutVO) = {
    DatabaseConnection.db.run(DBIO.sequence(
      for {
        answer <- poll.answers.toList
      } yield {
        PollOptionDAO.prepareOptionInsertOrUpdate(poll.id, answer)
      }
    ).transactionally)
      .onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on PollOption table!")
        case Failure(e)            => DatabaseConnection.logger.error(s"Error inserting PollOption: $e")
      }
  }

  def updatePublished(pollId: String) = {
    DatabaseConnection.db.run(
      TableQuery[PollDbTableDef]
        .filter(_.pollId === pollId)
        .map(p => (p.published, p.publishedAt))
        .update(true, Some(new java.sql.Timestamp(System.currentTimeMillis())))
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated published=true on Poll table!")
        case Failure(e)            => DatabaseConnection.logger.error(s"Error updating published=true Poll: $e")
      }
  }

  def updateEnded(pollId: String) = {
    DatabaseConnection.db.run(
      TableQuery[PollDbTableDef]
        .filter(_.pollId === pollId)
        .map(p => p.ended)
        .update(true)
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated awaitingResponses=false on Poll table!")
        case Failure(e)            => DatabaseConnection.logger.error(s"Error updating awaitingResponses=false Poll: $e")
      }
  }
}