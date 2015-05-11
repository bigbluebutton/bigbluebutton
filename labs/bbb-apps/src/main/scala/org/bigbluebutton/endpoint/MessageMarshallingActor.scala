package org.bigbluebutton.endpoint

import akka.actor.{Actor, ActorRef, ActorLogging, Props}
import org.bigbluebutton.apps.users.protocol.UsersMessageMarshalling

/**
 * This Actor is responsible for converting messages into JSON string
 * to be published into the pubsub.
 */
object MessageMarshallingActor {
  def props(pubsubActor: ActorRef): Props =  
        Props(classOf[MessageMarshallingActor], pubsubActor)
}

class MessageMarshallingActor private (val pubsubActor: ActorRef) extends Actor 
         with ActorLogging with UsersMessageMarshalling {

  def receive = {
    case msg: UserJoinResponseMessage => marshallUserJoinResponseMessage(msg)
    
    case unknownMsg => log.error("Cannot marshall unknown message: [{}]", unknownMsg)
  }
}