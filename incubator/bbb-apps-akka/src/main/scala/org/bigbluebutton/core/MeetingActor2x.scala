package org.bigbluebutton.core

import akka.actor.{ Actor, ActorLogging, Props }
import org.bigbluebutton.core.api.{ EjectUserFromMeeting, NewUserPresence2x, RegisterUser2xCommand, ValidateAuthToken }
import org.bigbluebutton.core.bus.IncomingEventBus
import org.bigbluebutton.core.domain.MeetingProperties2x
import org.bigbluebutton.core.filters.UsersHandlerFilter
import org.bigbluebutton.core.models.MeetingStateModel

object MeetingActor2x {
  def props(
    props: MeetingProperties2x,
    bus: IncomingEventBus,
    outGW: OutMessageGateway,
    state: MeetingStateModel): Props =
    Props(classOf[MeetingActor2x], props, bus, outGW, state)
}

class MeetingActor2x(
    val props: MeetingProperties2x,
    val bus: IncomingEventBus,
    val outGW: OutMessageGateway,
    val state: MeetingStateModel) extends Actor with ActorLogging with UsersHandlerFilter {

  def receive = {
    case msg: RegisterUser2xCommand => handleRegisterUser2x(msg)
    case msg: ValidateAuthToken => handleValidateAuthToken2x(msg)
    case msg: NewUserPresence2x => handleUserJoinWeb2x(msg)
    case msg: EjectUserFromMeeting => handleEjectUserFromMeeting(msg)
  }

}
