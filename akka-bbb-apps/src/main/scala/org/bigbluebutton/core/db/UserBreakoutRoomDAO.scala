package org.bigbluebutton.core.db

import org.bigbluebutton.core.domain.BreakoutRoom2x
import slick.jdbc.PostgresProfile.api._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{Failure, Success, Try}

case class UserBreakoutRoomDbModel(
        breakoutRoomId:  String,
        userId:        String,
        isDefaultName: Boolean,
        sequence: Int,
        shortName: String,
        online: Boolean,
)

class UserBreakoutRoomDbTableDef(tag: Tag) extends Table[UserBreakoutRoomDbModel](tag, None, "user_breakoutRoom") {
  override def * = (
    breakoutRoomId, userId, isDefaultName, sequence, shortName, online) <> (UserBreakoutRoomDbModel.tupled, UserBreakoutRoomDbModel.unapply)
  val userId = column[String]("userId", O.PrimaryKey)
  val breakoutRoomId = column[String]("breakoutRoomId")
  val isDefaultName = column[Boolean]("isDefaultName")
  val sequence = column[Int]("sequence")
  val shortName = column[String]("shortName")
  val online = column[Boolean]("online")
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
          online = true
        )
      )
    ).onComplete {
      case Success(rowsAffected) => {
        println(s"$rowsAffected row(s) inserted on user_breakoutRoom table!")
      }
      case Failure(e) => println(s"Error inserting user_breakoutRoom: $e")
    }
  }

  def updateLastBreakoutRoom(usersInRoom: Vector[String], breakoutRoom: BreakoutRoom2x) = {

    DatabaseConnection.db.run(
      TableQuery[UserBreakoutRoomDbTableDef]
        .filterNot(_.userId inSet usersInRoom)
        .filter(_.breakoutRoomId === breakoutRoom.id)
        .map(u_bk => u_bk.online)
        .update(false)
    ).onComplete {
      case Success(rowsAffected) => println(s"$rowsAffected row(s) updated online=false on user_breakoutRoom table!")
      case Failure(e) => println(s"Error updating online=false on user_breakoutRoom: $e")
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
            online = true
          )
        )
      }
    ).transactionally)
      .onComplete {
        case Success(rowsAffected) => println(s"$rowsAffected row(s) inserted on user_breakoutRoom table!")
        case Failure(e) => println(s"Error inserting user_breakoutRoom: $e")
      }
  }
}
