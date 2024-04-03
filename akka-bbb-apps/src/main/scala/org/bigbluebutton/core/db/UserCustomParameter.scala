package org.bigbluebutton.core.db

import slick.jdbc.PostgresProfile.api._
import slick.lifted.{ ProvenShape }

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }

case class UserCustomParameterDbModel(
    userId:    String,
    parameter: String,
    value:     String
)

class UserCustomParameterDbTableDef(tag: Tag) extends Table[UserCustomParameterDbModel](tag, "user_customParameter") {
  val userId = column[String]("userId", O.PrimaryKey)
  val parameter = column[String]("parameter", O.PrimaryKey)
  val value = column[String]("value")

  override def * : ProvenShape[UserCustomParameterDbModel] = (userId, parameter, value) <> (UserCustomParameterDbModel.tupled, UserCustomParameterDbModel.unapply)
}

object UserCustomParameterDAO {
  def insert(userId: String, customParameters: Map[String, String]) = {
    DatabaseConnection.db.run(DBIO.sequence(
      for {
        parameter <- customParameters
      } yield {
        TableQuery[UserCustomParameterDbTableDef].insertOrUpdate(
          UserCustomParameterDbModel(
            userId = userId,
            parameter = parameter._1,
            value = parameter._2
          )
        )
      }
    ).transactionally)
      .onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on UserCustomParameter table!")
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error inserting UserCustomParameter: $e")
      }
  }
}