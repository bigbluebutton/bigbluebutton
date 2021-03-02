package org.bigbluebutton.service

import akka.actor.{ Actor, ActorLogging, ActorSystem, Props }
import akka.util.Timeout

import scala.concurrent.Future
import scala.concurrent.duration._
import akka.pattern.{ AskTimeoutException, ask }
import org.bigbluebutton.core.BigBlueButtonActor

sealed trait HealthMessage

case class GetBigBlueButtonActorStatus(bbbActor: BigBlueButtonActor) extends HealthMessage
case class SetPubSubReceiveStatus(timestamp: Long) extends HealthMessage
case class SetRecordingDatabaseStatus(timestamp: Long) extends HealthMessage
case object GetHealthMessage extends HealthMessage

case class GetHealthResponseMessage(isHealthy: Boolean) extends HealthMessage

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
        GetHealthResponseMessage(isHealthy = false)
      }
    }
  }

  def sendReceiveStatusMessage(timestamp: Long): Unit = {
    healthActor ! SetPubSubReceiveStatus(timestamp)
  }

  def sendRecordingDBStatusMessage(timestamp: Long): Unit = {
    healthActor ! SetRecordingDatabaseStatus(timestamp)
  }
}

object HealthzActor {
  def props(): Props = Props(classOf[HealthzActor])
}

class HealthzActor extends Actor with ActorLogging {
  val twoMins = 2 * 60 * 1000
  var lastReceivedTimestamp = 0L
  var recordingDBResponseTimestamp = 0L

  override def receive: Receive = {
    case GetHealthMessage =>
      val status: Boolean = (computeElapsedTimeFromNow(lastReceivedTimestamp) < twoMins) &&
        (computeElapsedTimeFromNow(recordingDBResponseTimestamp) < twoMins)
      println(s"lastReceivedTimestamp: $lastReceivedTimestamp")
      println(s"recordingDBResponseTimestamp: $recordingDBResponseTimestamp")

      sender ! GetHealthResponseMessage(status)

    case SetPubSubReceiveStatus(timestamp) =>
      lastReceivedTimestamp = timestamp
    case SetRecordingDatabaseStatus(timestamp) =>
      recordingDBResponseTimestamp = timestamp
    case _ => println("unexpected message, exception could be raised")
  }

  def computeElapsedTimeFromNow(inputTimeStamp: Long): Long = {
    System.currentTimeMillis() - inputTimeStamp
  }
}