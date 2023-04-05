package org.bigbluebutton.core.db

import org.bigbluebutton.common2.domain.{ MetadataProp }
import slick.jdbc.PostgresProfile.api._
import slick.lifted.{ ProvenShape }

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }

case class MeetingMetadataDbModel(
    meetingId: String,
    name:      String,
    value:     String
)

class MeetingMetadataDbTableDef(tag: Tag) extends Table[MeetingMetadataDbModel](tag, "meeting_metadata") {
  //  def pk = primaryKey("user_whiteboard_pkey", (meetingId, name))
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val name = column[String]("name", O.PrimaryKey)
  val value = column[String]("value")

  //  def fk_meetingId: ForeignKeyQuery[MeetingDbTableDef, MeetingDbModel] = foreignKey("fk_meetingId", meetingId, TableQuery[MeetingDbTableDef])(_.meetingId)

  override def * : ProvenShape[MeetingMetadataDbModel] = (meetingId, name, value) <> (MeetingMetadataDbModel.tupled, MeetingMetadataDbModel.unapply)
}

object MeetingMetadataDAO {
  def insert(meetingId: String, metadataProp: MetadataProp) = {

    DatabaseConnection.db.run(DBIO.sequence(
      for {
        metadata <- metadataProp.metadata
      } yield {
        TableQuery[MeetingMetadataDbTableDef].insertOrUpdate(
          MeetingMetadataDbModel(
            meetingId = meetingId,
            name = metadata._1,
            value = metadata._2
          )
        )
      }
    ).transactionally)
      .onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on MeetingMetadata table!")
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error inserting MeetingMetadata: $e")
      }
  }
}