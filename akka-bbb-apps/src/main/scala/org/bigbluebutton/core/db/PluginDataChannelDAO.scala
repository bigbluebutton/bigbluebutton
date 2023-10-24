package org.bigbluebutton.core.db

import PostgresProfile.api._
import org.bigbluebutton.core.util.RandomStringGenerator
import spray.json.JsValue

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{Failure, Success}

case class PluginDataChannelDbModel(
    meetingId:        String,
    pluginName:       String,
    dataChannel:      String,
    msgId:            String,
    msgSenderUserId:  String,
    msgJson:          JsValue,
    toRole:           Option[String],
    toUserId:         Option[String],
    createdAt:        java.sql.Timestamp,
)

class PluginDataChannelDbTableDef(tag: Tag) extends Table[PluginDataChannelDbModel](tag, None, "pluginDataChannel") {
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val pluginName = column[String]("pluginName", O.PrimaryKey)
  val dataChannel = column[String]("dataChannel", O.PrimaryKey)
  val msgId = column[String]("msgId", O.PrimaryKey)
  val msgSenderUserId = column[String]("msgSenderUserId")
  val msgJson = column[JsValue]("msgJson")
  val toRole = column[Option[String]]("toRole")
  val toUserId = column[Option[String]]("toUserId")
  val createdAt = column[java.sql.Timestamp]("createdAt")
  override def * = (meetingId, pluginName, dataChannel, msgId, msgSenderUserId, msgJson, toRole, toUserId, createdAt) <> (PluginDataChannelDbModel.tupled, PluginDataChannelDbModel.unapply)
}

object PluginDataChannelDAO {
  def insert(meetingId: String, pluginName: String, dataChannel: String, senderUserId: String, msgJson: String, toRole: String, toUserId: String) = {
    DatabaseConnection.db.run(
      TableQuery[PluginDataChannelDbTableDef].insertOrUpdate(
        PluginDataChannelDbModel(
          meetingId = meetingId,
          pluginName = pluginName,
          dataChannel = dataChannel,
          msgId = RandomStringGenerator.randomAlphanumericString(8),
          msgSenderUserId = senderUserId,
          msgJson = JsonUtils.stringToJson(msgJson),
          toRole = toRole match {
            case "" => None
            case role => Some(role)
          },
          toUserId = toUserId match {
            case "" => None
            case userId => Some(userId)
          },
          createdAt = new java.sql.Timestamp(System.currentTimeMillis())
        )
      )
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on PluginDataChannel table!")
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error inserting PluginDataChannel: $e")
      }
  }
}