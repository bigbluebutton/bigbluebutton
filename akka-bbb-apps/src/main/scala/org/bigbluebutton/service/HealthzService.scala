package org.bigbluebutton.service

import akka.actor.{ Actor, ActorLogging, ActorSystem, Props }
import akka.util.Timeout

import scala.concurrent.Future
import scala.concurrent.duration._
import akka.pattern.{ AskTimeoutException, ask }
import org.bigbluebutton.core.BigBlueButtonActor

import java.time.{ Instant, LocalDateTime }
import java.util.TimeZone

sealed trait HealthMessage

case object GetHealthMessage extends HealthMessage
case class GetBigBlueButtonActorStatus(bbbActor: BigBlueButtonActor) extends HealthMessage
case class SetPubSubReceiveStatus(timestamp: Long) extends HealthMessage
case class SetPubSubStatus(sendTimestamp: Long, receiveTimestamp: Long) extends HealthMessage
case class SetRecordingDatabaseStatus(timestamp: Long) extends HealthMessage

case class GetHealthResponseMessage(
    isHealthy:             Boolean,
    pubSubSendStatus:      PubSubSendStatus,
    pubSubReceiveStatus:   PubSubReceiveStatus,
    recordingDBSendStatus: RecordingDBSendStatus
) extends HealthMessage

case class PubSubSendStatus(status: Boolean, timestamp: String)
case class PubSubReceiveStatus(status: Boolean, timestamp: String)
case class RecordingDBSendStatus(status: Boolean, timestamp: String)

object HealthzService {
  def apply(system: ActorSystem) = new HealthzService(system)
}

class HealthzService(system: ActorSystem) {
  implicit def executionContext = system.dispatcher
  implicit val timeout: Timeout = 2 seconds

  val healthActor = system.actorOf(HealthzActor.props())

  def getHealthz(): Future[GetHealthResponseMessage] = {
    val future = healthActor.ask(GetHealthMessage).mapTo[GetHealthResponseMessage]
    future.recover {
      case e: AskTimeoutException => {
        GetHealthResponseMessage(
          false,
          PubSubSendStatus(false, String.valueOf(0L)),
          PubSubReceiveStatus(false, String.valueOf(0L)),
          RecordingDBSendStatus(false, String.valueOf(0L))
        )
      }
    }
  }

  def sendPubSubStatusMessage(sendTimestamp: Long, receiveTimestamp: Long): Unit = {
    healthActor ! SetPubSubStatus(sendTimestamp, receiveTimestamp)
  }

  def sendRecordingDBStatusMessage(timestamp: Long): Unit = {
    healthActor ! SetRecordingDatabaseStatus(timestamp)
  }

}

object HealthzActor {
  def props(): Props = Props(classOf[HealthzActor])
}

class HealthzActor extends Actor with ActorLogging {
  val twoMins: Int = 2 * 60 * 1000
  var lastSentTimestamp: Long = 0L
  var lastReceivedTimestamp: Long = 0L
  var recordingDBResponseTimestamp: Long = 0L

  override def receive: Receive = {
    case GetHealthMessage =>
      val c1: Boolean = computeElapsedTimeFromNow(lastSentTimestamp) < 30000
      val c2: Boolean = computeElapsedTimeFromNow(lastReceivedTimestamp) < twoMins
      val c3: Boolean = computeElapsedTimeFromNow(recordingDBResponseTimestamp) < twoMins
      val status: Boolean = c1 && c2 && c3

      sender ! GetHealthResponseMessage(
        status,
        PubSubSendStatus(c1, convertLongTimestampToDateTimeString(lastSentTimestamp)),
        PubSubReceiveStatus(c2, convertLongTimestampToDateTimeString(lastReceivedTimestamp)),
        RecordingDBSendStatus(c3, convertLongTimestampToDateTimeString(recordingDBResponseTimestamp))
      )
    case SetPubSubStatus(sendTimestamp: Long, receiveTimestamp: Long) =>
      lastSentTimestamp = sendTimestamp
      lastReceivedTimestamp = receiveTimestamp
    case SetRecordingDatabaseStatus(timestamp) =>
      recordingDBResponseTimestamp = timestamp
    case _ => println("unexpected message, exception could be raised")
  }

  def computeElapsedTimeFromNow(inputTimeStamp: Long): Long = {
    System.currentTimeMillis() - inputTimeStamp
  }

  def convertLongTimestampToDateTimeString(inputTimestamp: Long): String = {
    LocalDateTime.ofInstant(Instant.ofEpochMilli(inputTimestamp), TimeZone.getDefault.toZoneId).toString
  }

}