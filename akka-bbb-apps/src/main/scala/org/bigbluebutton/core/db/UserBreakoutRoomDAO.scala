package org.bigbluebutton.core.db

import org.bigbluebutton.core.domain.BreakoutRoom2x
import slick.jdbc.PostgresProfile.api._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{Failure, Success }

case class UserBreakoutRoomDbModel(
        breakoutRoomId:  String,
        userId:        String,
        isDefaultName: Boolean,
        sequence: Int,
        shortName: String,
        currentlyInRoom: Boolean,
)

class UserBreakoutRoomDbTableDef(tag: Tag) extends Table[UserBreakoutRoomDbModel](tag, None, "user_breakoutRoom") {
  override def * = (
    breakoutRoomId, userId, isDefaultName, sequence, shortName, currentlyInRoom) <> (UserBreakoutRoomDbModel.tupled, UserBreakoutRoomDbModel.unapply)
  val userId = column[String]("userId", O.PrimaryKey)
  val breakoutRoomId = column[String]("breakoutRoomId")
  val isDefaultName = column[Boolean]("isDefaultName")
  val sequence = column[Int]("sequence")
  val shortName = column[String]("shortName")
  val currentlyInRoom = column[Boolean]("currentlyInRoom")
}

object UserBreakoutRoomDAO {

  def updateLastBreakoutRoom(userId: String, breakoutRoom: BreakoutRoom2x) = {

    DatabaseConnection.db.run(
      TableQuery[UserBreakoutRoomDbTableDef].insertOrUpdate(
        UserBreakoutRoomDbModel(
          userId = userId,
          breakoutRoomId = breakoutRoom.id,
          isDefaultName = breakoutRoom.isDefaultName,
          sequence = breakoutRoom.sequence,
          shortName = breakoutRoom.shortName,
          currentlyInRoom = true
        )
      )
    ).onComplete {
      case Success(rowsAffected) => {
        DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on user_breakoutRoom table!")
      }
      case Failure(e) => DatabaseConnection.logger.error(s"Error inserting user_breakoutRoom: $e")
    }
  }

  def updateLastBreakoutRoom(usersInRoom: Vector[String], breakoutRoom: BreakoutRoom2x) = {

    DatabaseConnection.db.run(
      TableQuery[UserBreakoutRoomDbTableDef]
        .filterNot(_.userId inSet usersInRoom)
        .filter(_.breakoutRoomId === breakoutRoom.id)
        .map(u_bk => u_bk.currentlyInRoom)
        .update(false)
    ).onComplete {
      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated currentlyInRoom=false on user_breakoutRoom table!")
      case Failure(e) => DatabaseConnection.logger.error(s"Error updating currentlyInRoom=false on user_breakoutRoom: $e")
    }

    DatabaseConnection.db.run(DBIO.sequence(
      for {
        userId <- usersInRoom
      } yield {
        TableQuery[UserBreakoutRoomDbTableDef].insertOrUpdate(
          UserBreakoutRoomDbModel(
            userId = userId,
            breakoutRoomId = breakoutRoom.id,
            isDefaultName = breakoutRoom.isDefaultName,
            sequence = breakoutRoom.sequence,
            shortName = breakoutRoom.shortName,
            currentlyInRoom = true
          )
        )
      }
    ).transactionally)
      .onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on user_breakoutRoom table!")
        case Failure(e) => DatabaseConnection.logger.error(s"Error inserting user_breakoutRoom: $e")
      }
  }
}
