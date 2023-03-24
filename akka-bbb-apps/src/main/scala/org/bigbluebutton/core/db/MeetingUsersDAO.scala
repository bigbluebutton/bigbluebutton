package org.bigbluebutton.core.db

import org.bigbluebutton.common2.domain.{ UsersProp}
import slick.jdbc.PostgresProfile.api._
import slick.lifted.{ ProvenShape }

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{Failure, Success }

case class MeetingUsersDbModel(
                                meetingId: String,
                                maxUsers: Int,
                                maxUserConcurrentAccesses: Int,
                                webcamsOnlyForModerator: Boolean,
                                userCameraCap: Int,
                                guestPolicy: String,
                                meetingLayout: String,
                                allowModsToUnmuteUsers: Boolean,
                                allowModsToEjectCameras: Boolean,
                                authenticatedGuest: Boolean
                              )

class MeetingUsersDbTableDef(tag: Tag) extends Table[MeetingUsersDbModel](tag, "meeting_users") {
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val maxUsers = column[Int]("maxUsers")
  val maxUserConcurrentAccesses = column[Int]("maxUserConcurrentAccesses")
  val webcamsOnlyForModerator = column[Boolean]("webcamsOnlyForModerator")
  val userCameraCap = column[Int]("userCameraCap")
  val guestPolicy = column[String]("guestPolicy")
  val meetingLayout = column[String]("meetingLayout")
  val allowModsToUnmuteUsers = column[Boolean]("allowModsToUnmuteUsers")
  val allowModsToEjectCameras = column[Boolean]("allowModsToEjectCameras")
  val authenticatedGuest = column[Boolean]("authenticatedGuest")

//  val fk_meetingId: ForeignKeyQuery[MeetingDbTableDef, MeetingDbModel] = foreignKey("fk_meetingId", meetingId, TableQuery[MeetingDbTableDef])(_.meetingId)

  override val * : ProvenShape[MeetingUsersDbModel] = (meetingId, maxUsers, maxUserConcurrentAccesses, webcamsOnlyForModerator, userCameraCap, guestPolicy, meetingLayout, allowModsToUnmuteUsers, allowModsToEjectCameras, authenticatedGuest) <> (MeetingUsersDbModel.tupled, MeetingUsersDbModel.unapply)
}

object MeetingUsersDAO {
  def insert(meetingId:String, usersProp: UsersProp) = {
    DatabaseConnection.db.run(
      TableQuery[MeetingUsersDbTableDef].forceInsert(
        MeetingUsersDbModel(
          meetingId = meetingId,
          maxUsers = usersProp.maxUsers,
          maxUserConcurrentAccesses = usersProp.maxUserConcurrentAccesses,
          webcamsOnlyForModerator = usersProp.webcamsOnlyForModerator,
          userCameraCap = usersProp.userCameraCap,
          guestPolicy = usersProp.guestPolicy,
          meetingLayout = usersProp.meetingLayout,
          allowModsToUnmuteUsers = usersProp.allowModsToUnmuteUsers,
          allowModsToEjectCameras = usersProp.allowModsToEjectCameras,
          authenticatedGuest = usersProp.authenticatedGuest,
        )
      )
    ).onComplete {
      case Success(rowsAffected) => {
        println(s"$rowsAffected row(s) inserted in MeetingUsers table!")
      }
      case Failure(e) => println(s"Error inserting MeetingUsers: $e")
    }
  }
}