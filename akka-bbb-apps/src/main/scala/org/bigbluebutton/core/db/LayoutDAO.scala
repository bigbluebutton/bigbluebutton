package org.bigbluebutton.core.db

import org.bigbluebutton.core.models.Layouts
import org.bigbluebutton.core.models.Layouts.{getCameraDockIsResizing, getCameraPosition, getCurrentLayout, getFocusedCamera, getPresentationIsOpen, getPresentationVideoRate, getPushLayout, setCurrentLayout}
import slick.jdbc.PostgresProfile.api._

import scala.util.{Failure, Success}
import scala.concurrent.ExecutionContext.Implicits.global

case class LayoutDbModel(
    meetingId:        String,
    currentLayoutType:        String,
    presentationMinimized:          Boolean,
    cameraDockIsResizing:           Boolean,
    cameraDockPlacement:             String,
    cameraDockAspectRatio:      Double,
    cameraWithFocus:        String,
    propagateLayout:          Boolean,
    updatedAt:        java.sql.Timestamp,
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
  val updatedAt = column[java.sql.Timestamp]("updatedAt")
  override def * = (meetingId, currentLayoutType, presentationMinimized, cameraDockIsResizing, cameraDockPlacement, cameraDockAspectRatio, cameraWithFocus, propagateLayout, updatedAt) <> (LayoutDbModel.tupled, LayoutDbModel.unapply)
}

object LayoutDAO {
  def insert(meetingId: String, currentLayoutType: String) = {
    val layoutDefaultValues = new Layouts()
    setCurrentLayout(layoutDefaultValues, currentLayoutType)

    insertOrUpdate(meetingId, layoutDefaultValues)
  }

  def insertOrUpdate(meetingId: String, layout: Layouts) = {
    DatabaseConnection.db.run(
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
          updatedAt = new java.sql.Timestamp(System.currentTimeMillis())
        )
      )
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted/updated on Layout table!")
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error inserting/updating Layout: $e")
      }
  }
}