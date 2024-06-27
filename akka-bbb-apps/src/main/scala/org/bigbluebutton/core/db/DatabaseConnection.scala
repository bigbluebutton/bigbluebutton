package org.bigbluebutton.core.db

import org.slf4j.LoggerFactory
import slick.jdbc.PostgresProfile.api._

import scala.concurrent.duration._
import java.util.concurrent.ConcurrentLinkedQueue
import scala.concurrent.ExecutionContext.Implicits.global
import java.util.concurrent.atomic.AtomicBoolean
import scala.util.control.Breaks.break

object DatabaseConnection {
  val db = Database.forConfig("postgres")
  val logger = LoggerFactory.getLogger(this.getClass)

  val queue = new ConcurrentLinkedQueue[DBIO[_]]()
  val isProcessing = new AtomicBoolean(false)
  val batchSizeLimit = 500

  // Initialize the scheduler for batch processing
  val system = org.apache.pekko.actor.ActorSystem("DBActionBatchSystem")
  system.scheduler.scheduleWithFixedDelay(50.millis, 50.millis)(new Runnable {
    def run(): Unit = tryProcessBatch()
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
    tryProcessBatch()
  }

  private def tryProcessBatch(): Unit = {
    if (isProcessing.compareAndSet(false, true)) {
      processBatch()
    }
  }

  private def processBatch(): Unit = {
    val batch = collection.mutable.ListBuffer[DBIO[_]]()
    var action = queue.poll()
    while (action != null) {
      batch += action
      if (batch.size >= batchSizeLimit) {
        break()
      }

      action = queue.poll()
    }

    if (batch.nonEmpty) {
      val combinedAction = DBIO.sequence(batch.toList)
      db.run(combinedAction).onComplete {
        case scala.util.Success(_) =>
          logger.debug(s"${batch.size} actions executed.")
          isProcessing.set(false)
          if (!queue.isEmpty) tryProcessBatch()
        case scala.util.Failure(e) =>
          logger.error(s"Error executing batch actions: $e")
          isProcessing.set(false)
          if (!queue.isEmpty) tryProcessBatch()
      }
    } else {
      isProcessing.set(false)
    }
  }
}
