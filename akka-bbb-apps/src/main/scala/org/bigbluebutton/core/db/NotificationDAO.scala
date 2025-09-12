package org.bigbluebutton.core.db
import org.bigbluebutton.common2.msgs.{BbbCommonEnvCoreMsg, NotifyAllInMeetingEvtMsg, NotifyRoleInMeetingEvtMsg, NotifyUserInMeetingEvtMsg}
import PostgresProfile.api._
import spray.json.JsValue

case class NotificationDbModel(
//    notificationId:        String,
    meetingId:          String,
    notificationType:   String,
    icon:               String,
    messageId:          String,
    messageDescription: String,
    messageValues:      JsValue,
    role:               Option[String],
    userMeetingId:      Option[String],
    userId:             Option[String],
    createdAt:          java.sql.Timestamp,
)

class NotificationDbTableDef(tag: Tag) extends Table[NotificationDbModel](tag, None, "notification") {
  val meetingId = column[String]("meetingId")
  val notificationType = column[String]("notificationType")
  val icon = column[String]("icon")
  val messageId = column[String]("messageId")
  val messageDescription = column[String]("messageDescription")
  val messageValues = column[JsValue]("messageValues")
  val role = column[Option[String]]("role")
  val userMeetingId = column[Option[String]]("userMeetingId")
  val userId = column[Option[String]]("userId")
  val createdAt = column[java.sql.Timestamp]("createdAt")
  override def * = (meetingId, notificationType, icon, messageId, messageDescription, messageValues, role, userMeetingId, userId, createdAt) <> (NotificationDbModel.tupled, NotificationDbModel.unapply)
}

object NotificationDAO {
  def insert(notification: BbbCommonEnvCoreMsg) = {

    val (meetingId, notificationType, icon, messageId, messageDescription, messageValues, role, userId) = notification.core match {
      case event: NotifyAllInMeetingEvtMsg =>
        (event.body.meetingId, event.body.notificationType, event.body.icon, event.body.messageId, event.body.messageDescription, event.body.messageValues, None, None)
      case event: NotifyRoleInMeetingEvtMsg =>
        (event.body.meetingId, event.body.notificationType, event.body.icon, event.body.messageId, event.body.messageDescription, event.body.messageValues, Some(event.body.role), None)
      case event: NotifyUserInMeetingEvtMsg =>
        (event.body.meetingId, event.body.notificationType, event.body.icon, event.body.messageId, event.body.messageDescription, event.body.messageValues, None, Some(event.body.userId))
      case _ =>
        ("","", "", "", "", Map(""->""), None, None)
    }

    if (notificationType != "") {
      DatabaseConnection.enqueue(
        TableQuery[NotificationDbTableDef].forceInsert(
          NotificationDbModel(
            meetingId,
            notificationType,
            icon,
            messageId,
            messageDescription,
            JsonUtils.mapToJson(messageValues),
            role,
            userMeetingId = userId match {
              case Some(u) => Some(meetingId)
              case _ => None
            },
            userId,
            createdAt = new java.sql.Timestamp(System.currentTimeMillis())
          )
        )
      )
    }
  }
}