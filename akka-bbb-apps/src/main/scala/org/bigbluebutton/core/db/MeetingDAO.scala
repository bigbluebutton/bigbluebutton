package org.bigbluebutton.core.db

import org.bigbluebutton.common2.domain.DefaultProps
import PostgresProfile.api._
import org.bigbluebutton.core.apps.groupchats.GroupChatApp

case class MeetingSystemColumnsDbModel(
      loginUrl:                              Option[String],
      logoutUrl:                             Option[String],
      customLogoUrl:                         Option[String],
      customDarkLogoUrl:                     Option[String],
      bannerText:                            Option[String],
      bannerColor:                           Option[String],
)

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
    systemColumns:                         MeetingSystemColumnsDbModel,
    createdTime:                           Long,
    durationInSeconds:                     Int,
    endWhenNoModerator:                    Boolean,
    endWhenNoModeratorDelayInMinutes:      Int,
    endedAt:                               Option[java.sql.Timestamp],
    endedReasonCode:                       Option[String],
    endedBy:                               Option[String],
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
    systemColumns,
    createdTime,
    durationInSeconds,
    endWhenNoModerator,
    endWhenNoModeratorDelayInMinutes,
    endedAt,
    endedReasonCode,
    endedBy
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
  val loginUrl = column[Option[String]]("loginUrl")
  val logoutUrl = column[Option[String]]("logoutUrl")
  val customLogoUrl = column[Option[String]]("customLogoUrl")
  val customDarkLogoUrl = column[Option[String]]("customDarkLogoUrl")
  val bannerText = column[Option[String]]("bannerText")
  val bannerColor = column[Option[String]]("bannerColor")
  val systemColumns = (loginUrl, logoutUrl, customLogoUrl, customDarkLogoUrl, bannerText, bannerColor) <> (MeetingSystemColumnsDbModel.tupled, MeetingSystemColumnsDbModel.unapply)
  val createdTime = column[Long]("createdTime")
  val durationInSeconds = column[Int]("durationInSeconds")
  val endWhenNoModerator = column[Boolean]("endWhenNoModerator")
  val endWhenNoModeratorDelayInMinutes = column[Int]("endWhenNoModeratorDelayInMinutes")
  val endedAt = column[Option[java.sql.Timestamp]]("endedAt")
  val endedReasonCode = column[Option[String]]("endedReasonCode")
  val endedBy = column[Option[String]]("endedBy")
}

object MeetingDAO {
  def insert(meetingProps: DefaultProps, clientSettings: Map[String, Object]) = {
    DatabaseConnection.enqueue(
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
          systemColumns = MeetingSystemColumnsDbModel(
            loginUrl = meetingProps.systemProps.loginUrl match {
              case "" => None
              case loginUrl => Some(loginUrl)
            },
            logoutUrl = meetingProps.systemProps.logoutUrl match {
              case "" => None
              case logoutUrl => Some(logoutUrl)
            },
            customLogoUrl = meetingProps.systemProps.customLogoURL match {
              case "" => None
              case logoUrl => Some(logoUrl)
            },
            customDarkLogoUrl = meetingProps.systemProps.customDarkLogoURL match {
              case "" => None
              case darkLogoUrl => Some(darkLogoUrl)
            },
            bannerText = meetingProps.systemProps.bannerText match {
              case "" => None
              case bannerText => Some(bannerText)
            },
            bannerColor = meetingProps.systemProps.bannerColor match {
              case "" => None
              case bannerColor => Some(bannerColor)
            },
          ),
          createdTime = meetingProps.durationProps.createdTime,
          durationInSeconds = meetingProps.durationProps.duration * 60,
          endWhenNoModerator = meetingProps.durationProps.endWhenNoModerator,
          endWhenNoModeratorDelayInMinutes = meetingProps.durationProps.endWhenNoModeratorDelayInMinutes,
          endedAt = None,
          endedReasonCode = None,
          endedBy = None
        )
      )
    )

    ChatDAO.insert(meetingProps.meetingProp.intId, GroupChatApp.createDefaultPublicGroupChat())
    MeetingUsersPoliciesDAO.insert(meetingProps.meetingProp.intId, meetingProps.usersProp)
    MeetingLockSettingsDAO.insert(meetingProps.meetingProp.intId, meetingProps.lockSettingsProps)
    MeetingMetadataDAO.insert(meetingProps.meetingProp.intId, meetingProps.metadataProp)
    MeetingRecordingPoliciesDAO.insert(meetingProps.meetingProp.intId, meetingProps.recordProp)
    MeetingVoiceDAO.insert(meetingProps.meetingProp.intId, meetingProps.voiceProp)
    MeetingWelcomeDAO.insert(meetingProps.meetingProp.intId, meetingProps.welcomeProp)
    MeetingGroupDAO.insert(meetingProps.meetingProp.intId, meetingProps.groups)
    MeetingBreakoutDAO.insert(meetingProps.meetingProp.intId, meetingProps.breakoutProps)
    LayoutDAO.insert(meetingProps.meetingProp.intId, meetingProps.usersProp.meetingLayout)
    MeetingClientSettingsDAO.insert(meetingProps.meetingProp.intId, JsonUtils.mapToJson(clientSettings))
  }

  def updateMeetingDurationByParentMeeting(parentMeetingId: String, newDurationInSeconds: Int) = {
    val subqueryBreakoutRooms = TableQuery[BreakoutRoomDbTableDef]
      .filter(_.parentMeetingId === parentMeetingId)
      .filter(_.endedAt.isEmpty)
      .map(_.externalId)

    DatabaseConnection.enqueue(
      TableQuery[MeetingDbTableDef]
        .filter(_.extId in subqueryBreakoutRooms)
        .map(u => u.durationInSeconds)
        .update(newDurationInSeconds)
    )
  }

  def delete(meetingId: String) = {
    DatabaseConnection.enqueue(
      TableQuery[MeetingDbTableDef]
        .filter(_.meetingId === meetingId)
        .delete
    )
  }

  def deleteOldMeetings() = {
    val oneHourAgo = java.sql.Timestamp.from(java.time.Instant.now().minusSeconds(3600))

    DatabaseConnection.enqueue(
      TableQuery[MeetingDbTableDef]
        .filter(_.endedAt < oneHourAgo)
        .delete
    )
  }


  def setMeetingEnded(meetingId: String, endedReasonCode: String, endedBy: String) = {

    UserDAO.softDeleteAllFromMeeting(meetingId)

    DatabaseConnection.enqueue(
      TableQuery[MeetingDbTableDef]
        .filter(_.meetingId === meetingId)
        .map(a => (a.endedAt, a.endedReasonCode, a.endedBy))
        .update(
              (
              Some(new java.sql.Timestamp(System.currentTimeMillis())),
              Some(endedReasonCode),
                endedBy match {
                  case "" => None
                  case c => Some(c)
                }
              )
        )
    )
  }

  def setAllMeetingsEnded(endedReasonCode: String, endedBy: String) = {
    DatabaseConnection.enqueue(
      TableQuery[MeetingDbTableDef]
        .filter(_.endedAt.isEmpty)
        .map(a => (a.endedAt, a.endedReasonCode, a.endedBy))
        .update(
          (
            Some(new java.sql.Timestamp(System.currentTimeMillis())),
            Some(endedReasonCode),
            endedBy match {
              case "" => None
              case c => Some(c)
            }
          )
        )
    )
  }


}
