package org.bigbluebutton.core.db

import org.bigbluebutton.common2.domain.DefaultProps
import PostgresProfile.api._
import org.bigbluebutton.core.apps.groupchats.GroupChatApp

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }

case class MeetingDbModel(
    meetingId:                             String,
    extId:                                 String,
    name:                                  String,
    isBreakout:                            Boolean,
    disabledFeatures:                      List[String],
    meetingCameraCap:                      Int,
    maxPinnedCameras:                      Int,
    notifyRecordingIsOn:                   Boolean,
    presentationUploadExternalDescription: String,
    presentationUploadExternalUrl:         String,
    learningDashboardAccessToken:          String,
    logoutUrl:                             String,
    customLogoUrl:                         Option[String],
    bannerText:                            Option[String],
    bannerColor:                           Option[String],
    createdTime:                           Long,
    durationInSeconds:                     Int,
    endedAt:                               Option[java.sql.Timestamp],
)

class MeetingDbTableDef(tag: Tag) extends Table[MeetingDbModel](tag, None, "meeting") {
  override def * = (
    meetingId,
    extId,
    name,
    isBreakout,
    disabledFeatures,
    meetingCameraCap,
    maxPinnedCameras,
    notifyRecordingIsOn,
    presentationUploadExternalDescription,
    presentationUploadExternalUrl,
    learningDashboardAccessToken,
    logoutUrl,
    customLogoUrl,
    bannerText,
    bannerColor,
    createdTime,
    durationInSeconds,
    endedAt
  ) <> (MeetingDbModel.tupled, MeetingDbModel.unapply)
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val extId = column[String]("extId")
  val name = column[String]("name")
  val isBreakout = column[Boolean]("isBreakout")
  val disabledFeatures = column[List[String]]("disabledFeatures")
  val meetingCameraCap = column[Int]("meetingCameraCap")
  val maxPinnedCameras = column[Int]("maxPinnedCameras")
  val notifyRecordingIsOn = column[Boolean]("notifyRecordingIsOn")
  val presentationUploadExternalDescription = column[String]("presentationUploadExternalDescription")
  val presentationUploadExternalUrl = column[String]("presentationUploadExternalUrl")
  val learningDashboardAccessToken = column[String]("learningDashboardAccessToken")
  val logoutUrl = column[String]("logoutUrl")
  val customLogoUrl = column[Option[String]]("customLogoUrl")
  val bannerText = column[Option[String]]("bannerText")
  val bannerColor = column[Option[String]]("bannerColor")
  val createdTime = column[Long]("createdTime")
  val durationInSeconds = column[Int]("durationInSeconds")
  val endedAt = column[Option[java.sql.Timestamp]]("endedAt")
}

object MeetingDAO {
  def insert(meetingProps: DefaultProps, clientSettings: Map[String, Object]) = {
    DatabaseConnection.db.run(
      TableQuery[MeetingDbTableDef].forceInsert(
        MeetingDbModel(
          meetingId = meetingProps.meetingProp.intId,
          extId = meetingProps.meetingProp.extId,
          name = meetingProps.meetingProp.name,
          isBreakout = meetingProps.meetingProp.isBreakout,
          disabledFeatures = meetingProps.meetingProp.disabledFeatures.toList,
          meetingCameraCap = meetingProps.meetingProp.meetingCameraCap,
          maxPinnedCameras = meetingProps.meetingProp.maxPinnedCameras,
          notifyRecordingIsOn = meetingProps.meetingProp.notifyRecordingIsOn,
          presentationUploadExternalDescription = meetingProps.meetingProp.presentationUploadExternalDescription,
          presentationUploadExternalUrl = meetingProps.meetingProp.presentationUploadExternalUrl,
          learningDashboardAccessToken = meetingProps.password.learningDashboardAccessToken,
          logoutUrl = meetingProps.systemProps.logoutUrl,
          customLogoUrl = meetingProps.systemProps.customLogoURL match {
            case "" => None
            case logoUrl => Some(logoUrl)
          },
          bannerText = meetingProps.systemProps.bannerText match {
            case "" => None
            case bannerText => Some(bannerText)
          },
          bannerColor = meetingProps.systemProps.bannerColor match {
            case "" => None
            case bannerColor => Some(bannerColor)
          },
          createdTime = meetingProps.durationProps.createdTime,
          durationInSeconds = meetingProps.durationProps.duration * 60,
          endedAt = None
        )
      )
    ).onComplete {
      case Success(rowsAffected) => {
        DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted in Meeting table!")
        ChatDAO.insert(meetingProps.meetingProp.intId, GroupChatApp.createDefaultPublicGroupChat())
        MeetingUsersPoliciesDAO.insert(meetingProps.meetingProp.intId, meetingProps.usersProp)
        MeetingLockSettingsDAO.insert(meetingProps.meetingProp.intId, meetingProps.lockSettingsProps)
        MeetingMetadataDAO.insert(meetingProps.meetingProp.intId, meetingProps.metadataProp)
        MeetingRecordingPoliciesDAO.insert(meetingProps.meetingProp.intId, meetingProps.recordProp)
        MeetingVoiceDAO.insert(meetingProps.meetingProp.intId, meetingProps.voiceProp)
        MeetingWelcomeDAO.insert(meetingProps.meetingProp.intId, meetingProps.welcomeProp)
        MeetingGroupDAO.insert(meetingProps.meetingProp.intId, meetingProps.groups)
        MeetingBreakoutDAO.insert(meetingProps.meetingProp.intId, meetingProps.breakoutProps)
        TimerDAO.insert(meetingProps.meetingProp.intId)
        LayoutDAO.insert(meetingProps.meetingProp.intId, meetingProps.usersProp.meetingLayout)
        MeetingClientSettingsDAO.insert(meetingProps.meetingProp.intId, JsonUtils.mapToJson(clientSettings))
      }
      case Failure(e) => DatabaseConnection.logger.error(s"Error inserting Meeting: $e")
    }
  }

  def updateMeetingDurationByParentMeeting(parentMeetingId: String, newDurationInSeconds: Int) = {
    val subqueryBreakoutRooms = TableQuery[BreakoutRoomDbTableDef]
      .filter(_.parentMeetingId === parentMeetingId)
      .filter(_.endedAt.isEmpty)
      .map(_.externalId)

    DatabaseConnection.db.run(
      TableQuery[MeetingDbTableDef]
        .filter(_.extId in subqueryBreakoutRooms)
        .map(u => u.durationInSeconds)
        .update(newDurationInSeconds)
    ).onComplete {
      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated durationInSeconds on Meeting table")
      case Failure(e) => DatabaseConnection.logger.debug(s"Error updating durationInSeconds on Meeting: $e")
    }
  }

  def delete(meetingId: String) = {
    DatabaseConnection.db.run(
      TableQuery[MeetingDbTableDef]
        .filter(_.meetingId === meetingId)
        .delete
    ).onComplete {
      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"Meeting ${meetingId} deleted")
      case Failure(e) => DatabaseConnection.logger.debug(s"Error deleting meeting ${meetingId}: $e")
    }
  }

  def setMeetingEnded(meetingId: String) = {

    UserDAO.softDeleteAllFromMeeting(meetingId)

    DatabaseConnection.db.run(
      TableQuery[MeetingDbTableDef]
        .filter(_.meetingId === meetingId)
        .map(a => (a.endedAt))
        .update(Some(new java.sql.Timestamp(System.currentTimeMillis())))
    ).onComplete {
      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated endedAt=now() on Meeting table!")
      case Failure(e) => DatabaseConnection.logger.debug(s"Error updating endedAt=now() Meeting: $e")
    }
  }
}
