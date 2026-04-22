package org.bigbluebutton.core.db

import PostgresProfile.api._
import spray.json.JsValue

case class PluginDbModel(
    meetingId:                     String,
    name:                          String,
    loggerSettings:                JsValue,
    javascriptEntrypointUrl:       String,
    javascriptEntrypointIntegrity: String,
    localesBaseUrl:                String,
    loadFailureReason:             String,
    loadFailureSource:             String
)

class PluginDbTableDef(tag: Tag) extends Table[PluginDbModel](tag, None, "plugin") {
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val name = column[String]("name", O.PrimaryKey)
  val loggerSettings = column[JsValue]("loggerSettings")
  val javascriptEntrypointUrl = column[String]("javascriptEntrypointUrl")
  val javascriptEntrypointIntegrity = column[String]("javascriptEntrypointIntegrity")
  val localesBaseUrl = column[String]("localesBaseUrl")
  val loadFailureReason = column[String]("loadFailureReason")
  val loadFailureSource = column[String]("loadFailureSource")
  override def * = (meetingId, name, loggerSettings, javascriptEntrypointUrl,
    javascriptEntrypointIntegrity, localesBaseUrl, loadFailureReason, loadFailureSource) <> (PluginDbModel.tupled, PluginDbModel.unapply)
}

object PluginDAO {
  def insert(meetingId: String, name: String, loggerSettings: Option[Map[String, Any]] ,javascriptEntrypointUrl: String,
             javascriptEntrypointIntegrity: String, localesBaseUrl: Option[String], loadFailureReason: Option[String],
             loadFailureSource: Option[String]
            ): Unit = {
    val localesBaseUrlValue = localesBaseUrl.getOrElse("")
    val loadFailureReasonValue = loadFailureReason.getOrElse("")
    val loadFailureSourceValue = loadFailureSource.getOrElse("")
    val loggerSettingsJson: JsValue = loggerSettings match {
      case Some(jsonValue: Map[String, Any]) => JsonUtils.mapToJson(jsonValue)
      case None => JsonUtils.stringToJson("{}")
    }
    DatabaseConnection.enqueue(
      TableQuery[PluginDbTableDef].forceInsert(
        PluginDbModel(
          meetingId = meetingId,
          name = name,
          loggerSettings = loggerSettingsJson,
          javascriptEntrypointUrl = javascriptEntrypointUrl,
          javascriptEntrypointIntegrity = javascriptEntrypointIntegrity,
          localesBaseUrl = localesBaseUrlValue,
          loadFailureReason = loadFailureReasonValue,
          loadFailureSource = loadFailureSourceValue,
        )
      )
    )
  }
}