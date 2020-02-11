package org.bigbluebutton.service

import akka.actor.{ Actor, ActorContext, ActorLogging, Props }
import akka.actor.ActorSystem
import akka.pattern.ask
import akka.util.Timeout
import com.google.gson.Gson

import scala.concurrent.duration._
import scala.concurrent.{ Future }

case class HealthzResponse(toFS: Array[String], fromFS: Map[String, String])
case class ToFSStatus(status: Vector[String])
case class FromFsStatus(status: Map[String, String])
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

  def setFreeswitchHeartbeat(json: Map[String, String]): Unit = {
    actorRef ! FromFsStatus(json)
  }

  def setFreeswitchStatus(json: Vector[String]): Unit = {
    actorRef ! ToFSStatus(json)
  }
}

object HealthzActor {
  def props(): Props = Props(classOf[HealthzActor])
}

class HealthzActor extends Actor
  with ActorLogging {

  var heartbeat: Map[String, String] = Map.empty
  var lastHeartbeatTimestamp: Long = System.currentTimeMillis()

  var fsStatus: Vector[String] = Vector.empty
  var lastFsStatus: Long = System.currentTimeMillis()

  def receive = {
    case msg: ToFSStatus =>
      val gson = new Gson()
      println("ToFSStatus => " + gson.toJson(msg.status.toArray))
      fsStatus = msg.status
      lastFsStatus = System.currentTimeMillis()
    case msg: FromFsStatus =>
      println("FromFsStatus => " + msg)
      val gson = new Gson()
      heartbeat = msg.status
      lastHeartbeatTimestamp = System.currentTimeMillis()
    case GetHealthStatus =>
      println("GetHealthStatus")
      println("GetHealthStatus => " + heartbeat)
      sender ! HealthzResponse(fsStatus.toArray, heartbeat)
    case _ => println("that was unexpected")
  }
}
