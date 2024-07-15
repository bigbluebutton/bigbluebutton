package org.bigbluebutton.core.db

import slick.jdbc.PostgresProfile.api._

case class SharedNotesRevDbModel(
    meetingId:        String,
    sharedNotesExtId: String,
    rev:              Int,
    userId:           String,
    changeset:        String,
    start:            Option[Int],
    end:              Option[Int],
    diff:             Option[String],
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
  val createdAt = column[java.sql.Timestamp]("createdAt")
  val * = (meetingId, sharedNotesExtId, rev, userId, changeset, start, end, diff, createdAt) <> (SharedNotesRevDbModel.tupled, SharedNotesRevDbModel.unapply)
}

object SharedNotesRevDAO {
  def insert(meetingId: String, sharedNotesExtId: String, revId: Int, userId: String, changeset: String) = {
    DatabaseConnection.enqueue(
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
          createdAt = new java.sql.Timestamp(System.currentTimeMillis())
        )
      )
    )
  }

  def update(meetingId: String, sharedNotesExtId: String, revId: Int, start: Int, end: Int, text: String) = {
    DatabaseConnection.enqueue(
      TableQuery[SharedNotesRevDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.sharedNotesExtId === sharedNotesExtId)
        .filter(_.rev === revId)
        .map(n => (n.start, n.end, n.diff))
        .update((Some(start), Some(end), Some(text)))
    )
  }
}