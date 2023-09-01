package org.bigbluebutton.core.db

import org.slf4j.LoggerFactory
import slick.jdbc.PostgresProfile.api._

import scala.concurrent.ExecutionContext.Implicits.global

object DatabaseConnection {
  val db = Database.forConfig("postgres")
  //  implicit val session: Session = db.createSession()
  val logger = LoggerFactory.getLogger(this.getClass)

  def initialize(): Unit = {
    db.run(sql"SELECT current_timestamp".as[java.sql.Timestamp]).map { timestamp =>
      logger.debug(s"Database initialized, current timestamp is: $timestamp")
    }.recover {
      case ex: Exception =>
        logger.error(s"Failed to initialize database: ${ex.getMessage}")
    }
  }
}
