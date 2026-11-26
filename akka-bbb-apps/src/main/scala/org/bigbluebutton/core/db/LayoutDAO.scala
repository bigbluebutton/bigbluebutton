package org.bigbluebutton.core.db

import org.bigbluebutton.core.models.Layouts
import org.bigbluebutton.core.models.Layouts.{getCameraDockSize, getCameraPosition, getCurrentLayout, getFocusedCamera, getPresentationIsOpen, getPushLayout, getScreenshareAsContent, getHideUsersWithoutCamera, setCurrentLayout}
import slick.jdbc.PostgresProfile.api._

case class LayoutDbModel(
    meetingId:              String,
    currentLayoutType:      String,
    presentationMinimized:  Boolean,
    cameraDockPlacement:    String,
    cameraDockSize:         Double,
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
  val cameraDockPlacement = column[String]("cameraDockPlacement")
  val cameraDockSize = column[Double]("cameraDockSize")
  val cameraWithFocus = column[String]("cameraWithFocus")
  val propagateLayout = column[Boolean]("propagateLayout")
  val screenshareAsContent = column[Boolean]("screenshareAsContent")
  val hideUsersWithoutCamera = column[Boolean]("hideUsersWithoutCamera")
  val setByUserId = column[String]("setByUserId")
  val updatedAt = column[java.sql.Timestamp]("updatedAt")
  override def * = (
    meetingId, currentLayoutType, presentationMinimized, cameraDockPlacement,
    cameraDockSize, cameraWithFocus, propagateLayout, screenshareAsContent, hideUsersWithoutCamera, setByUserId, updatedAt
  ) <> (LayoutDbModel.tupled, LayoutDbModel.unapply)
}

object LayoutDAO {
  def insert(meetingId: String, currentLayoutType: String, hideUsersWithoutCamera: Boolean) = {
    val layoutDefaultValues = new Layouts()
    setCurrentLayout(layoutDefaultValues, currentLayoutType)
    Layouts.setHideUsersWithoutCamera(layoutDefaultValues, hideUsersWithoutCamera)

    insertOrUpdate(meetingId, layoutDefaultValues)
  }

  def insertOrUpdate(meetingId: String, layout: Layouts) = {
    DatabaseConnection.enqueue(
      TableQuery[LayoutDbTableDef].insertOrUpdate(
        LayoutDbModel(
          meetingId = meetingId,
          currentLayoutType = getCurrentLayout(layout),
          presentationMinimized = !Layouts.getPresentationIsOpen(layout),
          cameraDockPlacement = getCameraPosition(layout),
          cameraDockSize = getCameraDockSize(layout),
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
