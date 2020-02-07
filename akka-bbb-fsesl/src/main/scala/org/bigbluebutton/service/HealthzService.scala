package org.bigbluebutton.service

import akka.actor.{Actor, ActorContext, ActorLogging, Props}
import akka.actor.ActorSystem
import akka.pattern.{ask}
import akka.util.Timeout
import scala.concurrent.duration._
import scala.util.Success
import scala.util.Failure

case class HealthzResponse(toFS: String, fromFS: String)
case class ToFSStatus(status: String)
case class FromFsStatus(status: String)
case object GetHealthStatus

class HealthzService() (implicit val context: ActorContext, system: ActorSystem) {
  implicit def executionContext = system.dispatcher

  val actorRef = context.actorOf(HealthzActor.props())

  def getHealthz():String = {
    val future = actorRef.ask(GetHealthStatus)(5 seconds)

    var toReturn = ""
    future onComplete {
      case Success(result) =>
        toReturn = "Success"
      case Failure(failure) =>
        toReturn = "Failed"
    }

    toReturn
  }
}

object HealthzActor {
  def props(): Props = Props(classOf[HealthzActor])
}

class HealthzActor extends Actor
  with ActorLogging {

  def receive = {
    case msg: ToFSStatus   => println(msg)
    case msg: FromFsStatus => println(msg)
    case GetHealthStatus   => println("GetHealthStatus")
    case _                 => println("that was unexpected")
  }
}