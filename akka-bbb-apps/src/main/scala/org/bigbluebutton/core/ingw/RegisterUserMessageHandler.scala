package org.bigbluebutton.core.ingw

import org.bigbluebutton.common.messages.RegisterUserMessage
import org.bigbluebutton.core.api.{ RegisterUser, Role }
import org.bigbluebutton.core.bus.{ BigBlueButtonEvent, IncomingEventBus }

trait RegisterUserMessageHandler {

  val eventBus: IncomingEventBus

  def handle(msg: RegisterUserMessage): Unit = {
    val userRole = if (msg.role == "MODERATOR") Role.MODERATOR else Role.VIEWER
    eventBus.publish(BigBlueButtonEvent(msg.meetingID,
      new RegisterUser(msg.meetingID, msg.internalUserId, msg.fullname, userRole, msg.externUserID,
        msg.authToken, msg.avatarURL, msg.guest, msg.authenticated)))
  }
}
