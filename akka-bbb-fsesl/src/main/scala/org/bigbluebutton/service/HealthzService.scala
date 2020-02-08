package org.bigbluebutton.service

import akka.actor.{ Actor, ActorContext, ActorLogging, Props }
import akka.actor.ActorSystem
import akka.pattern.ask
import akka.util.Timeout

import scala.concurrent.duration._
import scala.util.Success
import scala.util.Failure
import scala.concurrent.{ Await, Future }

case class HealthzResponse(toFS: String, fromFS: String)
case class ToFSStatus(status: String)
case class FromFsStatus(status: String)
case object GetHealthStatus

object HealthzService {
  def apply(system: ActorSystem) = new HealthzService(system)
}

class HealthzService(system: ActorSystem) {
  implicit def executionContext = system.dispatcher
  implicit val timeout: Timeout = 2.seconds

  val actorRef = system.actorOf(HealthzActor.props())

  def getHealthz(): Future[HealthzResponse] = {
    println("GETTING HEALTH")

    val future = actorRef.ask(GetHealthStatus).mapTo[HealthzResponse]
    //val result2 = Await.result(future, 1 second)
    /**
     * future onComplete {
     * case Success(result) =>
     * println("SUCCESS")
     * result.foreach { x =>
     * toRes = "Success"
     * }
     * case Failure(failure) =>
     * println("FAILED")
     * toRes = "failed"
     * }
     */
    println("************** GOT HERE !!!!!!!!")
    future
  }

  def setFreeswitchHeartbeat(json: String): Unit = {
    actorRef ! FromFsStatus(json)
  }

  def setFreeswitchStatus(json: String): Unit = {
    actorRef ! ToFSStatus(json)
  }
}

object HealthzActor {
  def props(): Props = Props(classOf[HealthzActor])
}

class HealthzActor extends Actor
  with ActorLogging {

  var heartbeat = ""
  var lastHeartbeatTimestamp: Long = System.currentTimeMillis()

  var fsStatus = ""
  var lastFsStatus: Long = System.currentTimeMillis()

  def receive = {
    case msg: ToFSStatus =>
      println(msg)
      fsStatus = msg.status
      lastFsStatus = System.currentTimeMillis()
    case msg: FromFsStatus =>
      println(msg)
      heartbeat = msg.status
      lastHeartbeatTimestamp = System.currentTimeMillis()
    case GetHealthStatus =>
      println("GetHealthStatus")
      sender ! HealthzResponse(fsStatus, heartbeat)
    case _ => println("that was unexpected")
  }
}
