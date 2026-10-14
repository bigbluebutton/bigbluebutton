package org.bigbluebutton.core.db

import org.bigbluebutton.core.models.Layouts
import org.bigbluebutton.core.models.Layouts.{getCameraDockIsResizing, getCameraPosition, getCurrentLayout, getFocusedCamera, getPresentationIsOpen, getPresentationVideoRate, getPushLayout, getScreenshareAsContent, getHideUsersWithoutCamera, setCurrentLayout}
import slick.jdbc.PostgresProfile.api._

case class LayoutDbModel(
    meetingId:              String,
    currentLayoutType:      String,
    presentationMinimized:  Boolean,
    cameraDockIsResizing:   Boolean,
    cameraDockPlacement:    String,
    cameraDockAspectRatio:  Double,
    cameraWithFocus:        String,
    propagateLayout:        Boolean,
    screenshareAsContent:   Boolean,
    hideUsersWithoutCamera: Boolean,
    setByUserId:            String,
    updatedAt:              java.sql.Timestamp,
)

class LayoutDbTableDef(tag: Tag) extends Table[LayoutDbModel](tag, None, "layout") {
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val currentLayoutType = column[String]("currentLayoutType")
  val presentationMinimized = column[Boolean]("presentationMinimized")
  val cameraDockIsResizing = column[Boolean]("cameraDockIsResizing")
  val cameraDockPlacement = column[String]("cameraDockPlacement")
  val cameraDockAspectRatio = column[Double]("cameraDockAspectRatio")
  val cameraWithFocus = column[String]("cameraWithFocus")
  val propagateLayout = column[Boolean]("propagateLayout")
  val screenshareAsContent = column[Boolean]("screenshareAsContent")
  val hideUsersWithoutCamera = column[Boolean]("hideUsersWithoutCamera")
  val setByUserId = column[String]("setByUserId")
  val updatedAt = column[java.sql.Timestamp]("updatedAt")
  override def * = (
    meetingId, currentLayoutType, presentationMinimized, cameraDockIsResizing, cameraDockPlacement,
    cameraDockAspectRatio, cameraWithFocus, propagateLayout, screenshareAsContent, hideUsersWithoutCamera, setByUserId, updatedAt
  ) <> (LayoutDbModel.tupled, LayoutDbModel.unapply)
}

object LayoutDAO {
  def insert(meetingId: String, currentLayoutType: String) = {
    val layoutDefaultValues = new Layouts()
    setCurrentLayout(layoutDefaultValues, currentLayoutType)

    insertOrUpdate(meetingId, layoutDefaultValues)
  }

  def insertOrUpdate(meetingId: String, layout: Layouts) = {
    DatabaseConnection.enqueue(
      TableQuery[LayoutDbTableDef].insertOrUpdate(
        LayoutDbModel(
          meetingId = meetingId,
          currentLayoutType = getCurrentLayout(layout),
          presentationMinimized = !Layouts.getPresentationIsOpen(layout),
          cameraDockIsResizing = getCameraDockIsResizing(layout),
          cameraDockPlacement = getCameraPosition(layout),
          cameraDockAspectRatio = getPresentationVideoRate(layout),
          cameraWithFocus = getFocusedCamera(layout),
          propagateLayout = getPushLayout(layout),
          screenshareAsContent = getScreenshareAsContent(layout),
          hideUsersWithoutCamera = getHideUsersWithoutCamera(layout),
          setByUserId = Layouts.getLayoutSetter(layout),
          updatedAt = new java.sql.Timestamp(System.currentTimeMillis())
        )
      )
    )
  }
}
