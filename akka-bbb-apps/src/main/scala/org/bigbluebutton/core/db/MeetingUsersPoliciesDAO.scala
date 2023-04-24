package org.bigbluebutton.core.db

import org.bigbluebutton.common2.domain.UsersProp
import org.bigbluebutton.core.models.GuestPolicy
import slick.jdbc.PostgresProfile.api._
import slick.lifted.ProvenShape

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{Failure, Success}

case class MeetingUsersPoliciesDbModel(
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

class MeetingUsersPoliciesDbTableDef(tag: Tag) extends Table[MeetingUsersPoliciesDbModel](tag, "meeting_usersPolicies") {
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

  override val * : ProvenShape[MeetingUsersPoliciesDbModel] = (meetingId, maxUsers, maxUserConcurrentAccesses, webcamsOnlyForModerator, userCameraCap, guestPolicy, meetingLayout, allowModsToUnmuteUsers, allowModsToEjectCameras, authenticatedGuest) <> (MeetingUsersPoliciesDbModel.tupled, MeetingUsersPoliciesDbModel.unapply)
}

object MeetingUsersPoliciesDAO {
  def insert(meetingId:String, usersProp: UsersProp) = {
    DatabaseConnection.db.run(
      TableQuery[MeetingUsersPoliciesDbTableDef].forceInsert(
        MeetingUsersPoliciesDbModel(
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
        DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted in MeetingUsersPolicies table!")
      }
      case Failure(e) => DatabaseConnection.logger.error(s"Error inserting MeetingUsersPolicies: $e")
    }
  }

  def update(meetingId: String, policy: GuestPolicy) = {
    DatabaseConnection.db.run(
      TableQuery[MeetingUsersPoliciesDbTableDef]
        .filter(_.meetingId === meetingId)
        .map(u => u.guestPolicy)
        .update(policy.policy)
    ).onComplete {
      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated on meeting_usersPolicies table!")
      case Failure(e) => DatabaseConnection.logger.error(s"Error updating meeting_usersPolicies: $e")
    }
  }
}