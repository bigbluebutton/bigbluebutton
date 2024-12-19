package org.bigbluebutton.core.db

import PostgresProfile.api._

case class PluginDbModel(
    meetingId:                            String,
    name:                                 String,
    javascriptEntrypointUrl:              String,
    javascriptEntrypointIntegrity:        String,
    assetPersistenceEnabled:              Boolean,
    assetPersistenceMaxFileSize:          Int,
    assetPersistenceMaxUploadSizePerUser: Int
)

class PluginDbTableDef(tag: Tag) extends Table[PluginDbModel](tag, None, "plugin") {
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val name = column[String]("name", O.PrimaryKey)
  val javascriptEntrypointUrl = column[String]("javascriptEntrypointUrl")
  val javascriptEntrypointIntegrity = column[String]("javascriptEntrypointIntegrity")
  val assetPersistenceEnabled = column[Boolean]("assetPersistenceEnabled")
  val assetPersistenceMaxFileSize = column[Int]("assetPersistenceMaxFileSize")
  val assetPersistenceMazUploadSizePerUser = column[Int]("assetPersistenceMaxUploadSizePerUser")
  override def * = (meetingId, name, javascriptEntrypointUrl, javascriptEntrypointIntegrity, assetPersistenceEnabled, assetPersistenceMaxFileSize, assetPersistenceMazUploadSizePerUser) <> (PluginDbModel.tupled, PluginDbModel.unapply)
}

object PluginDAO {
  def insert(meetingId: String, name: String, javascriptEntrypointUrl: String, javascriptEntrypointIntegrity: String,
             assetPersistenceEnabled: Boolean, assetPersistenceMaxFileSize: Int, assetPersistenceMazUploadSizePerUser: Int) = {
    DatabaseConnection.enqueue(
      TableQuery[PluginDbTableDef].forceInsert(
        PluginDbModel(
          meetingId = meetingId,
          name = name,
          javascriptEntrypointUrl = javascriptEntrypointUrl,
          javascriptEntrypointIntegrity = javascriptEntrypointIntegrity,
          assetPersistenceEnabled = assetPersistenceEnabled,
          assetPersistenceMaxFileSize = assetPersistenceMaxFileSize,
          assetPersistenceMaxUploadSizePerUser = assetPersistenceMazUploadSizePerUser
        )
      )
    )
  }
}