package org.bigbluebutton.core.db
import org.bigbluebutton.core.models.PadGroup
import slick.jdbc.PostgresProfile.api._

case class SharedNotesDbModel(
    meetingId:        String,
    sharedNotesExtId: String,
    padId:            String,
    model:            String,
    name:             String,
    pinned:           Boolean
)

class SharedNotesDbTableDef(tag: Tag) extends Table[SharedNotesDbModel](tag, None, "sharedNotes") {
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val sharedNotesExtId = column[String]("sharedNotesExtId", O.PrimaryKey)
  val padId = column[String]("padId")
  val model = column[String]("model")
  val name = column[String]("name")
  val pinned = column[Boolean]("pinned")
  val * = (
    meetingId, sharedNotesExtId, padId, model, name, pinned
  ) <> (SharedNotesDbModel.tupled, SharedNotesDbModel.unapply)
}

object SharedNotesDAO {
  def insert(meetingId: String, group: PadGroup, padId: String, name: String) = {
    DatabaseConnection.enqueue(
      TableQuery[SharedNotesDbTableDef].insertOrUpdate(
        SharedNotesDbModel(
          meetingId = meetingId,
          sharedNotesExtId = group.externalId,
          padId = padId,
          model = group.model,
          name = name,
          pinned = false
        )
      )
    )
  }

  def updatePinned(meetingId: String, sharedNotesExtId: String, pinned: Boolean) = {
    DatabaseConnection.enqueue(
      TableQuery[SharedNotesDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.sharedNotesExtId === sharedNotesExtId)
        .filter(_.pinned =!= pinned)
        .map(n => n.pinned)
        .update(pinned)
    )
  }
}