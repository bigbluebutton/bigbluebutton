package org.bigbluebutton.core.db

import org.slf4j.LoggerFactory
import slick.jdbc.PostgresProfile.api._
import scala.concurrent.duration._
import java.util.concurrent.ConcurrentLinkedQueue
import scala.jdk.CollectionConverters._
import scala.concurrent.ExecutionContext.Implicits.global

object DatabaseConnection {
  val db = Database.forConfig("postgres")
  val logger = LoggerFactory.getLogger(this.getClass)

  val queue = new ConcurrentLinkedQueue[DBIO[_]]()

  // Initialize the scheduler for batch processing
  val system = org.apache.pekko.actor.ActorSystem("DBActionBatchSystem")
  system.scheduler.scheduleWithFixedDelay(50.millis, 50.millis)(new Runnable {
    def run(): Unit = processBatch()
  })

  def initialize(): Unit = {
    db.run(sql"SELECT current_timestamp".as[java.sql.Timestamp]).map { timestamp =>
      logger.debug(s"Database initialized, current timestamp is: $timestamp")
    }.recover {
      case ex: Exception =>
        logger.error(s"Failed to initialize database: ${ex.getMessage}")
    }
  }

  def enqueue(action: DBIO[_]): Unit = {
    queue.add(action)
  }

  private def processBatch(): Unit = {
    if (!queue.isEmpty) {
      val batch = queue.iterator().asScala.toSeq
      queue.clear() // Clear the queue
      val combinedAction = DBIO.sequence(batch)
      db.run(combinedAction).onComplete {
        case scala.util.Success(_) => {
          logger.debug(s"${batch.size} actions executed.")
          if (!queue.isEmpty) {
            processBatch()
          }
        }
        case scala.util.Failure(e) => logger.error(s"Error executing batch actions: $e")
      }
    }
  }
}
