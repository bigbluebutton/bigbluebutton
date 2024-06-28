package org.bigbluebutton.core.db

import org.bigbluebutton.common2.domain.UsersProp
import org.bigbluebutton.core.models.GuestPolicy
import slick.jdbc.PostgresProfile.api._
import slick.lifted.ProvenShape

case class MeetingUsersPoliciesDbModel(
                                meetingId: String,
                                maxUsers: Int,
                                maxUserConcurrentAccesses: Int,
                                webcamsOnlyForModerator: Boolean,
                                userCameraCap: Int,
                                guestPolicy: String,
                                guestLobbyMessage: Option[String],
                                meetingLayout: String,
                                allowModsToUnmuteUsers: Boolean,
                                allowModsToEjectCameras: Boolean,
                                authenticatedGuest: Boolean,
                                allowPromoteGuestToModerator: Boolean
                              )

class MeetingUsersPoliciesDbTableDef(tag: Tag) extends Table[MeetingUsersPoliciesDbModel](tag, "meeting_usersPolicies") {
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val maxUsers = column[Int]("maxUsers")
  val maxUserConcurrentAccesses = column[Int]("maxUserConcurrentAccesses")
  val webcamsOnlyForModerator = column[Boolean]("webcamsOnlyForModerator")
  val userCameraCap = column[Int]("userCameraCap")
  val guestPolicy = column[String]("guestPolicy")
  val guestLobbyMessage = column[Option[String]]("guestLobbyMessage")
  val meetingLayout = column[String]("meetingLayout")
  val allowModsToUnmuteUsers = column[Boolean]("allowModsToUnmuteUsers")
  val allowModsToEjectCameras = column[Boolean]("allowModsToEjectCameras")
  val authenticatedGuest = column[Boolean]("authenticatedGuest")
  val allowPromoteGuestToModerator = column[Boolean]("allowPromoteGuestToModerator")

//  val fk_meetingId: ForeignKeyQuery[MeetingDbTableDef, MeetingDbModel] = foreignKey("fk_meetingId", meetingId, TableQuery[MeetingDbTableDef])(_.meetingId)

  override val * : ProvenShape[MeetingUsersPoliciesDbModel] = (meetingId, maxUsers, maxUserConcurrentAccesses, webcamsOnlyForModerator, userCameraCap, guestPolicy, guestLobbyMessage, meetingLayout, allowModsToUnmuteUsers, allowModsToEjectCameras, authenticatedGuest, allowPromoteGuestToModerator) <> (MeetingUsersPoliciesDbModel.tupled, MeetingUsersPoliciesDbModel.unapply)
}

object MeetingUsersPoliciesDAO {
  def insert(meetingId:String, usersProp: UsersProp) = {
    DatabaseConnection.enqueue(
      TableQuery[MeetingUsersPoliciesDbTableDef].forceInsert(
        MeetingUsersPoliciesDbModel(
          meetingId = meetingId,
          maxUsers = usersProp.maxUsers,
          maxUserConcurrentAccesses = usersProp.maxUserConcurrentAccesses,
          webcamsOnlyForModerator = usersProp.webcamsOnlyForModerator,
          userCameraCap = usersProp.userCameraCap,
          guestPolicy = usersProp.guestPolicy,
          guestLobbyMessage = None,
          meetingLayout = usersProp.meetingLayout,
          allowModsToUnmuteUsers = usersProp.allowModsToUnmuteUsers,
          allowModsToEjectCameras = usersProp.allowModsToEjectCameras,
          authenticatedGuest = usersProp.authenticatedGuest,
          allowPromoteGuestToModerator = usersProp.allowPromoteGuestToModerator,
        )
      )
    )
  }

  def update(meetingId: String, policy: GuestPolicy) = {
    DatabaseConnection.enqueue(
      TableQuery[MeetingUsersPoliciesDbTableDef]
        .filter(_.meetingId === meetingId)
        .map(u => u.guestPolicy)
        .update(policy.policy)
    )
  }

  def updateGuestLobbyMessage(meetingId: String, guestLobbyMessage: String) = {
    DatabaseConnection.enqueue(
      TableQuery[MeetingUsersPoliciesDbTableDef]
        .filter(_.meetingId === meetingId)
        .map(u => u.guestLobbyMessage)
        .update(
          guestLobbyMessage match {
            case "" => None
            case m => Some(m)
          }
        )
    )
  }

  def updateWebcamsOnlyForModerator(meetingId: String, webcamsOnlyForModerator: Boolean) = {
    DatabaseConnection.enqueue(
      TableQuery[MeetingUsersPoliciesDbTableDef]
        .filter(_.meetingId === meetingId)
        .map(u => u.webcamsOnlyForModerator)
        .update(webcamsOnlyForModerator)
    )
  }

}