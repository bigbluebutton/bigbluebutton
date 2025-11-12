package org.bigbluebutton.core.db

import org.bigbluebutton.core.domain.BreakoutRoom2x
import slick.jdbc.PostgresProfile.api._

case class UserBreakoutRoomPropsDbModel(
        meetingId:        String,
        userId:           String,
        parentMeetingId:  String,
        parentUserId:     String,
        isDefaultName:    Boolean,
        sequence:         Int,
        shortName:        String,
        currentlyInRoom:  Boolean,
)

class UserBreakoutRoomPropsDbTableDef(tag: Tag) extends Table[UserBreakoutRoomPropsDbModel](tag, None, "user_breakoutRoomProps") {
  override def * = (
    meetingId, userId, parentMeetingId, parentUserId, isDefaultName, sequence, shortName, currentlyInRoom
  ) <> (UserBreakoutRoomPropsDbModel.tupled, UserBreakoutRoomPropsDbModel.unapply)
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val userId = column[String]("userId", O.PrimaryKey)
  val parentMeetingId = column[String]("parentMeetingId")
  val parentUserId = column[String]("parentUserId")
  val isDefaultName = column[Boolean]("isDefaultName")
  val sequence = column[Int]("sequence")
  val shortName = column[String]("shortName")
  val currentlyInRoom = column[Boolean]("currentlyInRoom")
}
/*
object UserBreakoutRoomPropsDAO {

  def updateLastBreakoutRoomProps(meetingId: String, userId: String, breakoutRoom: BreakoutRoom2x) = {
    DatabaseConnection.enqueue(
      TableQuery[UserBreakoutRoomPropsDbTableDef].insertOrUpdate(
        UserBreakoutRoomPropsDbModel(
          meetingId = meetingId,
          userId = userId,
          parentMeetingId = breakoutRoom.id,
          parentUserId = "",
          isDefaultName = breakoutRoom.isDefaultName,
          sequence = breakoutRoom.sequence,
          shortName = breakoutRoom.shortName,
          currentlyInRoom = true
        )
      )
    )
  }

  def updateLastBreakoutRoomProps(meetingId:String, usersInRoom: Vector[String], breakoutRoom: BreakoutRoom2x) = {

    DatabaseConnection.enqueue(
      TableQuery[UserBreakoutRoomPropsDbTableDef]
        .filter(_.meetingId === breakoutRoom.id)
        .filterNot(_.userId inSet breakoutRoom.users.map(u => u.id))
//        .filter(_.parentMeetingId === breakoutRoom.id)
        .map(u_bk => u_bk.currentlyInRoom)
        .update(false)
    )

    DatabaseConnection.enqueue(DBIO.sequence(
      for {
        bkUser <- breakoutRoom.users
      } yield {
        TableQuery[UserBreakoutRoomPropsDbTableDef].insertOrUpdate(
          UserBreakoutRoomPropsDbModel(
            meetingId = breakoutRoom.id,
            userId = bkUser.id,
            parentMeetingId = meetingId,
            parentUserId = "",
            isDefaultName = breakoutRoom.isDefaultName,
            sequence = breakoutRoom.sequence,
            shortName = breakoutRoom.shortName,
            currentlyInRoom = true
          )
        )
      }
    ).transactionally)
  }
}
*/