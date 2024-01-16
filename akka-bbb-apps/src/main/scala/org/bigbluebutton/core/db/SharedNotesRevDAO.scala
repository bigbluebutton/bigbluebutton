package org.bigbluebutton.core.db

import slick.jdbc.PostgresProfile.api._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }

case class SharedNotesRevDbModel(
    meetingId:        String,
    sharedNotesExtId: String,
    rev:              Int,
    userId:           String,
    changeset:        String,
    start:            Option[Int],
    end:              Option[Int],
    diff:             Option[String],
    fullContentHtml:  Option[String],
    createdAt:        java.sql.Timestamp
)

class SharedNotesRevDbTableDef(tag: Tag) extends Table[SharedNotesRevDbModel](tag, None, "sharedNotes_rev") {
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val sharedNotesExtId = column[String]("sharedNotesExtId", O.PrimaryKey)
  val rev = column[Int]("rev", O.PrimaryKey)
  val userId = column[String]("userId")
  val changeset = column[String]("changeset")
  val start = column[Option[Int]]("start")
  val end = column[Option[Int]]("end")
  val diff = column[Option[String]]("diff")
  val fullContentHtml = column[Option[String]]("fullContentHtml")
  val createdAt = column[java.sql.Timestamp]("createdAt")
  val * = (meetingId, sharedNotesExtId, rev, userId, changeset, start, end, diff, fullContentHtml, createdAt) <> (SharedNotesRevDbModel.tupled, SharedNotesRevDbModel.unapply)
}

object SharedNotesRevDAO {
  def insert(meetingId: String, sharedNotesExtId: String, revId: Int, userId: String, changeset: String) = {
    DatabaseConnection.db.run(
      TableQuery[SharedNotesRevDbTableDef].insertOrUpdate(
        SharedNotesRevDbModel(
          meetingId = meetingId,
          sharedNotesExtId = sharedNotesExtId,
          rev = revId,
          userId = userId,
          changeset = changeset,
          start = None,
          end = None,
          diff = None,
          fullContentHtml = None,
          createdAt = new java.sql.Timestamp(System.currentTimeMillis())
        )
      )
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on SharedNotesRev table!")
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error inserting SharedNotesRev: $e")
      }
  }

  def update(meetingId: String, sharedNotesExtId: String, revId: Int, start: Int, end: Int, diffText: String, fullContentHtml: String) = {
    DatabaseConnection.db.run(
      TableQuery[SharedNotesRevDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.sharedNotesExtId === sharedNotesExtId)
        .filter(_.rev === revId)
        .map(n => (n.start, n.end, n.diff, n.fullContentHtml))
        .update((Some(start), Some(end), Some(diffText), Some(fullContentHtml)))
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated Rev on SharedNotes table!")
        case Failure(e)            => DatabaseConnection.logger.error(s"Error updating Rev SharedNotes: $e")
      }
  }
}