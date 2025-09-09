package org.bigbluebutton.core.db

import PostgresProfile.api._

case class PluginDbModel(
    meetingId:                     String,
    name:                          String,
    javascriptEntrypointUrl:       String,
    javascriptEntrypointIntegrity: String,
    localesBaseUrl:                String,
    loadFailureReason:             String,
    loadFailureSource:             String
)

class PluginDbTableDef(tag: Tag) extends Table[PluginDbModel](tag, None, "plugin") {
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val name = column[String]("name", O.PrimaryKey)
  val javascriptEntrypointUrl = column[String]("javascriptEntrypointUrl")
  val javascriptEntrypointIntegrity = column[String]("javascriptEntrypointIntegrity")
  val localesBaseUrl = column[String]("localesBaseUrl")
  val loadFailureReason = column[String]("loadFailureReason")
  val loadFailureSource = column[String]("loadFailureSource")
  override def * = (meetingId, name, javascriptEntrypointUrl,
    javascriptEntrypointIntegrity, localesBaseUrl, loadFailureReason, loadFailureSource) <> (PluginDbModel.tupled, PluginDbModel.unapply)
}

object PluginDAO {
  def insert(meetingId: String, name: String, javascriptEntrypointUrl: String,
             javascriptEntrypointIntegrity: String, localesBaseUrl: Option[String], loadFailureReason: Option[String],
             loadFailureSource: Option[String]
            ): Unit = {
    val localesBaseUrlValue = localesBaseUrl.getOrElse("")
    val loadFailureReasonValue = loadFailureReason.getOrElse("")
    val loadFailureSourceValue = loadFailureSource.getOrElse("")
    DatabaseConnection.enqueue(
      TableQuery[PluginDbTableDef].forceInsert(
        PluginDbModel(
          meetingId = meetingId,
          name = name,
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