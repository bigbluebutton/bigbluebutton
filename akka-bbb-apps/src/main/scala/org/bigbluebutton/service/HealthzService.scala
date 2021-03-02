package org.bigbluebutton.service

import akka.actor.{ Actor, ActorLogging, ActorSystem, Props }
import akka.util.Timeout

import scala.concurrent.Future
import scala.concurrent.duration.DurationInt
import akka.pattern.{ AskTimeoutException, ask }

sealed trait HealthMessage

case object GetHealthMessage extends HealthMessage
case class GetHealthResponseMessage(isHealthy: Boolean) extends HealthMessage

object HealthzService {
  def apply(system: ActorSystem) = new HealthzService(system)
}

class HealthzService(system: ActorSystem) {
  implicit def executionContext = system.dispatcher
  implicit val timeout: Timeout = 2 seconds

  val actorRef = system.actorOf(HealthzActor.props())

  def getHealthz(): Future[GetHealthResponseMessage] = {
    val future = actorRef.ask(GetHealthMessage).mapTo[GetHealthResponseMessage]
    future.recover {
      case e: AskTimeoutException => {
        GetHealthResponseMessage(isHealthy = false)
      }
    }
  }

}

object HealthzActor {
  def props(): Props = Props(classOf[HealthzActor])
}

class HealthzActor extends Actor with ActorLogging {
  override def receive: Receive = {
    case GetHealthMessage => sender ! GetHealthResponseMessage(isHealthy = true)
    case _                => println("unexpected message, exception could be raised")
  }
}