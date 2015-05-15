package org.bigbluebutton.endpoint

import akka.actor.{ Actor, ActorRef, ActorLogging, Props }

/**
 * This Actor is responsible for building formatted messages that
 * will be sent to the pubsub.
 */
object OutMsgBuilderActor {
  def props(pubsubActor: ActorRef): Props =
    Props(classOf[OutMsgBuilderActor], pubsubActor)
}

class OutMsgBuilderActor private (val bbbAppsActor: ActorRef,
  val messageMarshallingActor: ActorRef) extends Actor
    with ActorLogging {

  def receive = {
    case unknownMsg => log.error("Cannot handle unknown message: [{}]", unknownMsg)
  }
}