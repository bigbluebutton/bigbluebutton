package org.bigbluebutton.core

import akka.actor.ActorContext
import org.bigbluebutton.core.api.ValidateAuthToken
import org.bigbluebutton.core.bus.IncomingEventBus
import org.bigbluebutton.core.domain.UserActorRef
import org.bigbluebutton.core.models.{ Meeting3x, UserActorRefs }

trait MeetingActorMessageHandler {
  val meeting: Meeting3x
  val context: ActorContext
  val eventBus: IncomingEventBus
  val outGW: OutMessageGateway
  val userActorRefs = new UserActorRefs

  def handleValidateAuthToken(msg: ValidateAuthToken): Unit = {
    // check if there is already a user actor
    // check if there is a registered user
    // start a user actor
    // forward validate token

    def delegate(msg: ValidateAuthToken): Unit = {
      /*      meeting.registeredUsers.findWithToken(msg.token) match {
        case Some(u) =>
          val actorRef = context.actorOf(UserActor.props(meeting.props, eventBus, outGW), msg.userId.value)
          userActorRefs.save(UserActorRef(msg.userId, actorRef))
        case None =>
        // sender.sendValidateAuthTokenReplyMessage(meeting.props.id, msg.userId, msg.token, false, msg.correlationId)
      }
*/ }

    userActorRefs findWithId (msg.userId) match {
      case Some(ref) => ref.actorRef ! msg
      case None => delegate(msg)
    }
  }
}
