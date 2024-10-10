package org.bigbluebutton.core.db

import PostgresProfile.api._

case class PluginDbModel(
  meetingId:          String,
  name:         String,
  javascriptEntrypointUrl:        String,
  javascriptEntrypointChecksum:       String
)

class PluginDbTableDef(tag: Tag) extends Table[PluginDbModel](tag, None, "plugin") {
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val name = column[String]("name", O.PrimaryKey)
  val javascriptEntrypointUrl = column[String]("javascriptEntrypointUrl")
  val javascriptEntrypointChecksum = column[String]("javascriptEntrypointChecksum")
  override def * = (meetingId, name, javascriptEntrypointUrl, javascriptEntrypointChecksum) <> (PluginDbModel.tupled, PluginDbModel.unapply)
}

object PluginDAO {
  def insert(meetingId: String, name: String, javascriptEntrypointUrl: String, javascriptEntrypointChecksum: String) = {
    DatabaseConnection.enqueue(
      TableQuery[PluginDbTableDef].forceInsert(
        PluginDbModel(
          meetingId = meetingId,
          name = name,
          javascriptEntrypointUrl = javascriptEntrypointUrl,
          javascriptEntrypointChecksum = javascriptEntrypointChecksum,
        )
      )
    )
  }
}