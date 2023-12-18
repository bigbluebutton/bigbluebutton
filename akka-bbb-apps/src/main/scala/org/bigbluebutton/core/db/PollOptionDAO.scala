package org.bigbluebutton.core.db

import org.bigbluebutton.common2.domain.SimpleVoteOutVO
import org.bigbluebutton.core.models.Answer
import slick.jdbc.PostgresProfile.api._

case class PollOptionDbModel(
    pollId:     String,
    optionId:   Int,
    optionDesc: String
)

class PollOptionDbTableDef(tag: Tag) extends Table[PollOptionDbModel](tag, None, "poll_option") {
  val pollId = column[String]("pollId", O.PrimaryKey)
  val optionId = column[Int]("optionId", O.PrimaryKey)
  val optionDesc = column[String]("optionDesc")
  //  val pk = primaryKey("poll_option_pkey", (pollId, optionId))
  val * = (pollId, optionId, optionDesc) <> (PollOptionDbModel.tupled, PollOptionDbModel.unapply)
}

object PollOptionDAO {
  def prepareOptionInsert(pollId: String, answer: Answer) = {
    TableQuery[PollOptionDbTableDef].forceInsert(
      PollOptionDbModel(
        pollId = pollId,
        optionId = answer.id,
        optionDesc = answer.key
      )
    )
  }

  def prepareOptionInsertOrUpdate(pollId: String, answer: SimpleVoteOutVO) = {
    TableQuery[PollOptionDbTableDef].insertOrUpdate(
      PollOptionDbModel(
        pollId = pollId,
        optionId = answer.id,
        optionDesc = answer.key
      )
    )
  }
}