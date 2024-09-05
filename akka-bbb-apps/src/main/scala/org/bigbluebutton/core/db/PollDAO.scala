package org.bigbluebutton.core.db

import org.bigbluebutton.common2.domain.SimplePollResultOutVO
import org.bigbluebutton.core.models.Poll
import slick.jdbc.PostgresProfile.api._

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
      DatabaseConnection.enqueue(
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
      )
      DatabaseConnection.enqueue(DBIO.sequence(
        for {
          answer <- question.answers.toList
        } yield {
          PollOptionDAO.prepareOptionInsert(poll.id, answer)
        }
      ).transactionally)
    }
  }

  def updateOptions(poll: SimplePollResultOutVO) = {
    DatabaseConnection.enqueue(DBIO.sequence(
      for {
        answer <- poll.answers.toList
      } yield {
        PollOptionDAO.prepareOptionInsertOrUpdate(poll.id, answer)
      }
    ).transactionally)
  }

  def updatePublished(pollId: String) = {
    DatabaseConnection.enqueue(
      TableQuery[PollDbTableDef]
        .filter(_.pollId === pollId)
        .map(p => (p.published, p.publishedAt))
        .update(true, Some(new java.sql.Timestamp(System.currentTimeMillis())))
    )
  }

  def updateEnded(pollId: String) = {
    DatabaseConnection.enqueue(
      TableQuery[PollDbTableDef]
        .filter(_.pollId === pollId)
        .map(p => p.ended)
        .update(true)
    )
  }
}