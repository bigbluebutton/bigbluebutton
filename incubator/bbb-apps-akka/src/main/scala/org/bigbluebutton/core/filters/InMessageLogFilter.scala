package org.bigbluebutton.core.filters

import org.bigbluebutton.core.api.{ UserJoining, EjectUserFromMeeting }
import org.bigbluebutton.core.LiveMeeting
import org.bigbluebutton.core.handlers.UsersHandler
import akka.actor.ActorContext
import akka.event.Logging

trait InMessageLogFilter extends UsersHandler {
  this: LiveMeeting =>

  val log = Logging(context.system, getClass)

  abstract override def handleEjectUserFromMeeting(msg: EjectUserFromMeeting) {
    for {
      user <- meeting.getUser(msg.userId)
      // if user can ejectUser {
      //     // forward message to handler to process
      //     super.handleEjectUserFromMeeting(msg)
      // } else {
      //     send request rejected message
      // }
    } super.handleEjectUserFromMeeting(msg)
  }

  abstract override def handleUserJoin(msg: UserJoining): Unit = {
    log.debug("Received user joined meeting. metingId=" + props.id + " userId=" + msg.userId)
    super.handleUserJoin(msg)
  }
}