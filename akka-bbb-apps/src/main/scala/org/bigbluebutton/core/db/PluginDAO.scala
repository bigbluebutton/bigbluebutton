package org.bigbluebutton.core.db

import PostgresProfile.api._

case class PluginDbModel(
  meetingId:          String,
  name:         String,
  javascriptEntrypointUrl:        String,
  pluginJavascriptChecksum:       String,
)

class PluginDbTableDef(tag: Tag) extends Table[PluginDbModel](tag, None, "plugin") {
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val name = column[String]("name", O.PrimaryKey)
  val javascriptEntrypointUrl = column[String]("javascriptEntrypointUrl")
  val pluginJavascriptChecksum = column[String]("pluginJavascriptChecksum")
  override def * = (meetingId, name, javascriptEntrypointUrl, pluginJavascriptChecksum) <> (PluginDbModel.tupled, PluginDbModel.unapply)
}

object PluginDAO {
  def insert(meetingId: String, name: String, javascriptEntrypointUrl: String, pluginJavascriptChecksum: String) = {
    DatabaseConnection.enqueue(
      TableQuery[PluginDbTableDef].forceInsert(
        PluginDbModel(
          meetingId = meetingId,
          name = name,
          javascriptEntrypointUrl = javascriptEntrypointUrl,
          pluginJavascriptChecksum = pluginJavascriptChecksum,
        )
      )
    )
  }
}