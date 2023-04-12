package org.bigbluebutton.core.db

import org.bigbluebutton.common2.domain.DefaultProps
import PostgresProfile.api._
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
    createdTime:                           Long,
    duration:                              Int
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
    createdTime,
    duration
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
  val createdTime = column[Long]("createdTime")
  val duration = column[Int]("duration")
}

object MeetingDAO {
  def insert(meetingProps: DefaultProps) = {
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
          createdTime = meetingProps.durationProps.createdTime,
          duration = meetingProps.durationProps.duration
        )
      )
    ).onComplete {
        case Success(rowsAffected) => {
          DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted in Meeting table!")
          MeetingUsersPoliciesDAO.insert(meetingProps.meetingProp.intId, meetingProps.usersProp)
          MeetingLockSettingsDAO.insert(meetingProps.meetingProp.intId, meetingProps.lockSettingsProps)
          MeetingMetadataDAO.insert(meetingProps.meetingProp.intId, meetingProps.metadataProp)
          MeetingRecordingDAO.insert(meetingProps.meetingProp.intId, meetingProps.recordProp)
          MeetingVoiceDAO.insert(meetingProps.meetingProp.intId, meetingProps.voiceProp)
          MeetingWelcomeDAO.insert(meetingProps.meetingProp.intId, meetingProps.welcomeProp)
          MeetingGroupDAO.insert(meetingProps.meetingProp.intId, meetingProps.groups)
          MeetingBreakoutDAO.insert(meetingProps.meetingProp.intId, meetingProps.breakoutProps)
        }
        case Failure(e) => DatabaseConnection.logger.error(s"Error inserting Meeting: $e")
      }
  }

  def delete(meetingIg: String) = {
    DatabaseConnection.db.run(
      TableQuery[MeetingDbTableDef]
        .filter(_.meetingId === meetingIg)
        .delete
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"Meeting ${meetingIg} deleted")
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error deleting meeting ${meetingIg}: $e")
      }
  }

}
