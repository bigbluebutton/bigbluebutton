package org.bigbluebutton.core.db

import PostgresProfile.api._
import org.bigbluebutton.core.db.DatabaseConnection.{db, logger}
import org.bigbluebutton.core.util.RandomStringGenerator
import spray.json.JsValue
import scala.concurrent.Await
import scala.concurrent.duration.Duration

object Permission {
  val allowedRoles = List("MODERATOR","VIEWER","PRESENTER")
}

case class PluginDataChannelEntryDbModel(
    meetingId:          String,
    pluginName:         String,
    channelName:        String,
    subChannelName:     String,
    entryId:            Option[String] = None,
    payloadJson:        JsValue,
    createdBy:         String,
    toRoles:            Option[List[String]],
    toUserIds:          Option[List[String]],
    createdAt:          java.sql.Timestamp,
    deletedAt:          Option[java.sql.Timestamp],
)

class PluginDataChannelEntryDbTableDef(tag: Tag) extends Table[PluginDataChannelEntryDbModel](tag, None, "pluginDataChannelEntry") {
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val pluginName = column[String]("pluginName", O.PrimaryKey)
  val channelName = column[String]("channelName", O.PrimaryKey)
  val subChannelName = column[String]("subChannelName")
  val entryId = column[Option[String]]("entryId", O.PrimaryKey)
  val payloadJson = column[JsValue]("payloadJson")
  val createdBy = column[String]("createdBy")
  val toRoles = column[Option[List[String]]]("toRoles")
  val toUserIds = column[Option[List[String]]]("toUserIds")
  val createdAt = column[java.sql.Timestamp]("createdAt")
  val deletedAt = column[Option[java.sql.Timestamp]]("deletedAt")
  override def * = (meetingId, pluginName, channelName, subChannelName, entryId, payloadJson, createdBy, toRoles, toUserIds, createdAt, deletedAt) <> (PluginDataChannelEntryDbModel.tupled, PluginDataChannelEntryDbModel.unapply)
}

object PluginDataChannelEntryDAO {
  def insert(meetingId: String, pluginName: String, channelName: String, subChannelName: String, createdBy: String,
             payloadJson: Map[String, Any], toRoles: List[String], toUserIds: List[String]) = {
    DatabaseConnection.enqueue(
      TableQuery[PluginDataChannelEntryDbTableDef].forceInsert(
        PluginDataChannelEntryDbModel(
          entryId = Some(RandomStringGenerator.randomAlphanumericString(50)),
          meetingId = meetingId,
          pluginName = pluginName,
          channelName = channelName,
          subChannelName = subChannelName,
          payloadJson = JsonUtils.mapToJson(payloadJson),
          createdBy = createdBy,
          toRoles = toRoles.map(_.toUpperCase).filter(Permission.allowedRoles.contains) match {
            case Nil => None
            case filtered => Some(filtered)
          },
          toUserIds = if(toUserIds.isEmpty) None else Some(toUserIds),
          createdAt = new java.sql.Timestamp(System.currentTimeMillis()),
          deletedAt = None
        )
      )
    )
  }

  def reset(meetingId: String, pluginName: String,
            channelName: String, subChannelName: String) = {
    DatabaseConnection.enqueue(
      TableQuery[PluginDataChannelEntryDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.pluginName === pluginName)
        .filter(_.channelName === channelName)
        .filter(_.subChannelName === subChannelName)
        .filter(_.deletedAt.isEmpty)
        .map(u => (u.deletedAt))
        .update(Some(new java.sql.Timestamp(System.currentTimeMillis())))
    )
  }

  def getEntryCreator(meetingId: String, pluginName: String, channelName: String,
                      subChannelName: String, entryId: String): String = {
      val query = sql"""SELECT "createdBy"
             FROM "pluginDataChannelEntry"
                WHERE "deletedAt" is null
                AND "meetingId" = ${meetingId}
                AND "pluginName" = ${pluginName}
                AND "channelName" = ${channelName}
                AND "subChannelName" = ${subChannelName}
                AND "entryId" = ${entryId}""".as[String].headOption

      Await.result(DatabaseConnection.db.run(query), Duration.Inf) match {
        case Some(userId) => userId
        case None => {
          logger.debug("Message {} not found in database (maybe it was deleted).", entryId)
          ""
        }
      }
  }

  def delete(meetingId: String, pluginName: String,
             channelName: String, subChannelName: String,  entryId: String) = {
    DatabaseConnection.enqueue(
      sqlu"""UPDATE "pluginDataChannelEntry" SET
                "deletedAt" = current_timestamp
                WHERE "deletedAt" is null
                AND "meetingId" = ${meetingId}
                AND "pluginName" = ${pluginName}
                AND "channelName" = ${channelName}
                AND "subChannelName" = ${subChannelName}
                AND "entryId" = ${entryId}"""
    )
  }

  def replace(meetingId: String, pluginName: String, channelName: String,
             subChannelName: String,  entryId: String, payloadJson: JsValue) = {

    DatabaseConnection.enqueue(
      TableQuery[PluginDataChannelEntryDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.pluginName === pluginName)
        .filter(_.channelName === channelName)
        .filter(_.subChannelName === subChannelName)
        .filter(_.entryId === entryId)
        .filter(_.deletedAt.isEmpty)
        .map(_.payloadJson)
        .update(payloadJson)
    )
  }

}