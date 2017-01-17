package org.bigbluebutton.core.ingw

import org.bigbluebutton.messages.RegisterUserMessage
import org.bigbluebutton.core.api.{ RegisterUser, Role }
import org.bigbluebutton.core.bus.{ BigBlueButtonEvent, IncomingEventBus }

trait RegisterUserMessageHdlr {

  val eventBus: IncomingEventBus

  def handle(msg: RegisterUserMessage): Unit = {
    val userRole = if (msg.payload.role == "MODERATOR") Role.MODERATOR else Role.VIEWER
    eventBus.publish(BigBlueButtonEvent(msg.payload.meetingID,
      new RegisterUser(msg.payload.meetingID, msg.payload.internalUserId, msg.payload.fullname, userRole, msg.payload.externUserID,
        msg.payload.authToken, msg.payload.avatarURL, msg.payload.guest, msg.payload.authenticated)))
  }
}
