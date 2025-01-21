package org.bigbluebutton.core.db

import org.bigbluebutton.common2.domain.DefaultProps
import PostgresProfile.api._
import org.bigbluebutton.core.apps.groupchats.GroupChatApp
import org.bigbluebutton.core.models.PluginModel

case class MeetingSystemColumnsDbModel(
      loginUrl:                              Option[String],
      logoutUrl:                             Option[String],
      customLogoUrl:                         Option[String],
      customDarkLogoUrl:                     Option[String],
      bannerText:                            Option[String],
      bannerColor:                           Option[String],
)

case class PresentationUploadExternalDbModel(
      presentationUploadExternalDescription: String,
      presentationUploadExternalUrl:         String,
)

case class ScreenSharePermissionsDbModel(
     screenShareBroadcastAllowedFor:         String,
     viewerScreenShareViewAllowedFor:        String,
)

case class MeetingDbModel(
    meetingId:                             String,
    extId:                                 String,
    name:                                  String,
    isBreakout:                            Boolean,
    disabledFeatures:                      List[String],
    meetingCameraCap:                      Int,
    maxPinnedCameras:                      Int,
    cameraBridge:                          String,
    screenShareBridge:                     String,
    audioBridge:                           String,
    notifyRecordingIsOn:                   Boolean,
    learningDashboardAccessToken:          String,
    createdTime:                           Long,
    durationInSeconds:                     Int,
    endWhenNoModerator:                    Boolean,
    endWhenNoModeratorDelayInMinutes:      Int,
    endedAt:                               Option[java.sql.Timestamp],
    endedReasonCode:                       Option[String],
    endedBy:                               Option[String],
    systemColumns:                         MeetingSystemColumnsDbModel,
    PresentationUploadExternal:            PresentationUploadExternalDbModel,
    screenSharePermissions:                ScreenSharePermissionsDbModel,
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
    cameraBridge,
    screenShareBridge,
    audioBridge,
    notifyRecordingIsOn,
    learningDashboardAccessToken,
    createdTime,
    durationInSeconds,
    endWhenNoModerator,
    endWhenNoModeratorDelayInMinutes,
    endedAt,
    endedReasonCode,
    endedBy,
    systemColumns,
    PresentationUploadExternal,
    screenSharePermissions,
  ) <> (MeetingDbModel.tupled, MeetingDbModel.unapply)
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val extId = column[String]("extId")
  val name = column[String]("name")
  val isBreakout = column[Boolean]("isBreakout")
  val disabledFeatures = column[List[String]]("disabledFeatures")
  val meetingCameraCap = column[Int]("meetingCameraCap")
  val maxPinnedCameras = column[Int]("maxPinnedCameras")
  val cameraBridge = column[String]("cameraBridge")
  val screenShareBridge = column[String]("screenShareBridge")
  val screenShareBroadcastAllowedFor = column[String]("screenShareBroadcastAllowedFor")
  val viewerScreenShareViewAllowedFor = column[String]("viewerScreenShareViewAllowedFor")
  val audioBridge = column[String]("audioBridge")
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
  val PresentationUploadExternal = (presentationUploadExternalDescription, presentationUploadExternalUrl) <> (PresentationUploadExternalDbModel.tupled, PresentationUploadExternalDbModel.unapply)
  val screenSharePermissions = (screenShareBroadcastAllowedFor, viewerScreenShareViewAllowedFor) <> (ScreenSharePermissionsDbModel.tupled, ScreenSharePermissionsDbModel.unapply)
  val createdTime = column[Long]("createdTime")
  val durationInSeconds = column[Int]("durationInSeconds")
  val endWhenNoModerator = column[Boolean]("endWhenNoModerator")
  val endWhenNoModeratorDelayInMinutes = column[Int]("endWhenNoModeratorDelayInMinutes")
  val endedAt = column[Option[java.sql.Timestamp]]("endedAt")
  val endedReasonCode = column[Option[String]]("endedReasonCode")
  val endedBy = column[Option[String]]("endedBy")
}

object MeetingDAO {
  def insert(meetingProps: DefaultProps, clientSettings: Map[String, Object], pluginProps: PluginModel): Unit = {
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
          cameraBridge = meetingProps.meetingProp.cameraBridge,
          screenShareBridge = meetingProps.meetingProp.screenShareBridge,
          audioBridge = meetingProps.meetingProp.audioBridge,
          notifyRecordingIsOn = meetingProps.meetingProp.notifyRecordingIsOn,
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
          PresentationUploadExternal = PresentationUploadExternalDbModel(
            presentationUploadExternalDescription = meetingProps.meetingProp.presentationUploadExternalDescription match {
              case "" => ""
              case presentationUploadExternalDescription => presentationUploadExternalDescription
            },
            presentationUploadExternalUrl = meetingProps.meetingProp.presentationUploadExternalUrl match {
              case "" => ""
              case presentationUploadExternalUrl => presentationUploadExternalUrl
            },
          ),
          screenSharePermissions = ScreenSharePermissionsDbModel(
            screenShareBroadcastAllowedFor = meetingProps.meetingProp.screenShareBroadcastAllowedFor match {
              case "" => ""
              case screenShareBroadcastAllowedFor => screenShareBroadcastAllowedFor
            },
            viewerScreenShareViewAllowedFor = meetingProps.meetingProp.viewerScreenShareViewAllowedFor match {
              case "" => ""
              case viewerScreenShareViewAllowedFor => viewerScreenShareViewAllowedFor
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
    PluginModel.persistPluginsForClient(pluginProps, meetingProps.meetingProp.intId)
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

  def updateScreenSharePermissions(parentMeetingId: String, screenShareBroadcastAllowedFor: String, viewerScreenShareViewAllowedFor: String, setBy: String) = {
    DatabaseConnection.enqueue(
      TableQuery[MeetingDbTableDef]
        .filter(_.meetingId === parentMeetingId)
        .map(m => (m.screenShareBroadcastAllowedFor, m.viewerScreenShareViewAllowedFor))
        .update((
          screenShareBroadcastAllowedFor,
          viewerScreenShareViewAllowedFor
        ))
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
