package org.bigbluebutton.core.db

import org.bigbluebutton.common2.domain.GroupProps
import PostgresProfile.api._
import slick.lifted.ProvenShape

case class MeetingGroupDbModel(
    meetingId:  String,
    groupId:    String,
    groupIndex: Int,
    name:       String,
    usersExtId: List[String]
)

class MeetingGroupDbTableDef(tag: Tag) extends Table[MeetingGroupDbModel](tag, None, "meeting_group") {
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val groupId = column[String]("groupId", O.PrimaryKey)
  val groupIndex = column[Int]("groupIndex")
  val name = column[String]("name")
  val usersExtId = column[List[String]]("usersExtId", O.SqlType("varchar[]"))

  //  def fk_meetingId: ForeignKeyQuery[MeetingDbTableDef, MeetingDbModel] = foreignKey("fk_meetingId", meetingId, TableQuery[MeetingDbTableDef])(_.meetingId)

  override def * : ProvenShape[MeetingGroupDbModel] = (meetingId, groupId, groupIndex, name, usersExtId) <> (MeetingGroupDbModel.tupled, MeetingGroupDbModel.unapply)
}

object MeetingGroupDAO {
  def insert(meetingId: String, groups: Vector[GroupProps]) = {
    DatabaseConnection.enqueue(DBIO.sequence(
      for {
        (group, groupIndex) <- groups.zipWithIndex
      } yield {
        TableQuery[MeetingGroupDbTableDef].insertOrUpdate(
          MeetingGroupDbModel(
            meetingId = meetingId,
            groupId = group.groupId,
            groupIndex = groupIndex,
            name = group.name,
            usersExtId = group.usersExtId.toList
          )
        )
      }
    ).transactionally)
  }
}