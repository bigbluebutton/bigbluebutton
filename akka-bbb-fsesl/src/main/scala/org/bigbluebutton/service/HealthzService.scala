package org.bigbluebutton.service

import java.text.SimpleDateFormat

import akka.actor.{ Actor, ActorLogging, Props }
import akka.actor.ActorSystem
import akka.pattern.{ AskTimeoutException, ask }
import akka.util.Timeout

import scala.concurrent.duration._
import scala.concurrent.Future

sealed trait HealthMessage

case class FreeswitchStatusMessage(status: Vector[String]) extends HealthMessage
case class FreeswitchHeartbeatMessage(status: Map[String, String]) extends HealthMessage
case class GetHealthResponseMessage(isHealthy: Boolean) extends HealthMessage
case object GetHealthMessage extends HealthMessage
case object GetFreeswitchStatusMessage extends HealthMessage
case class GetFreeswitchStatusResponseMessage(status: Array[String], heartbeat: Map[String, String]) extends HealthMessage

case class FreeswitchStatus(lastUpdateOn: Long, lastUpdateOnHuman: String, status: Vector[String])
case class FreeswitchHeartbeat(lastUpdateOn: Long, lastUpdateOnHuman: String, heartbeat: Map[String, String])

object HealthzService {
  def apply(system: ActorSystem) = new HealthzService(system)
}

class HealthzService(system: ActorSystem) {
  implicit def executionContext = system.dispatcher
  implicit val timeout: Timeout = 2.seconds

  val actorRef = system.actorOf(HealthzActor.props())

  def getHealthz(): Future[GetHealthResponseMessage] = {
    val future = actorRef.ask(GetHealthMessage).mapTo[GetHealthResponseMessage]
    future.recover {
      case e: AskTimeoutException => GetHealthResponseMessage(isHealthy = false)
    }
  }

  def getFreeswitchStatus(): Future[GetFreeswitchStatusResponseMessage] = {
    val future = actorRef.ask(GetFreeswitchStatusMessage).mapTo[GetFreeswitchStatusResponseMessage]
    future.recover {
      case e: AskTimeoutException => GetFreeswitchStatusResponseMessage(Vector.empty.toArray, Map.empty)
    }
  }

  def setFreeswitchHeartbeat(json: Map[String, String]): Unit = {
    actorRef ! FreeswitchHeartbeatMessage(json)
  }

  def setFreeswitchStatus(json: Vector[String]): Unit = {
    actorRef ! FreeswitchStatusMessage(json)
  }
}

object HealthzActor {
  def props(): Props = Props(classOf[HealthzActor])
}

class HealthzActor extends Actor
  with ActorLogging {

  val sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSX")
  val now = System.currentTimeMillis()
  var heartbeat = FreeswitchHeartbeat(now, sdf.format(now), Map.empty)
  var status = FreeswitchStatus(now, sdf.format(now), Vector.empty)

  val twoMins = 2 * 60 * 1000

  def receive = {
    case msg: FreeswitchStatusMessage =>
      val now = System.currentTimeMillis()
      status = FreeswitchStatus(now, sdf.format(now), msg.status)
    case msg: FreeswitchHeartbeatMessage =>
      val now = System.currentTimeMillis()
      heartbeat = FreeswitchHeartbeat(now, sdf.format(now), msg.status)
    case GetHealthMessage =>
      val now = System.currentTimeMillis()
      if ((now - heartbeat.lastUpdateOn < twoMins) &&
        (now - status.lastUpdateOn < twoMins)) {
        sender ! GetHealthResponseMessage(isHealthy = true)
      } else {
        sender ! GetHealthResponseMessage(isHealthy = false)
      }
    case GetFreeswitchStatusMessage =>
      sender ! GetFreeswitchStatusResponseMessage(status.status.toArray, heartbeat.heartbeat)

    case _ => println("that was unexpected")
  }
}
