package org.bigbluebutton.endpoint

import akka.util.Timeout
import scala.concurrent.duration._
import akka.actor.{ Actor, ActorRef, ActorLogging, Props }
import org.bigbluebutton.apps.users.protocol.UsersMessageHandler

/**
 * This actor is responsible for handling messages from the pubsub.
 */
object MessageHandlerActor {
  def props(bbbAppsActor: ActorRef, messageMarshallingActor: ActorRef): Props =
    Props(classOf[MessageHandlerActor], bbbAppsActor, messageMarshallingActor)
}

class MessageHandlerActor private (val bbbAppsActor: ActorRef,
  val messageMarshallingActor: ActorRef) extends Actor
    with ActorLogging {

  /** RefFactory for actor request-response (ask pattern) **/
  def actorRefFactory = context

  /** Required for actor request-response (ask pattern) **/
  implicit def executionContext = actorRefFactory.dispatcher
  implicit val timeout = Timeout(5 seconds)

  def receive = {
    case msg: UserJoinRequestFormat => //handleUserJoinRequestMessage(msg)

    case unknownMsg => log.error("Cannot handle unknown message: [{}]", unknownMsg)
  }
}