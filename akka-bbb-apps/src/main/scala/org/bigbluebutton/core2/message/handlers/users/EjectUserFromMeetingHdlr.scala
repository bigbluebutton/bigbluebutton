package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api._
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core.util.Model1x2xConverter

trait EjectUserFromMeetingHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handle(msg: EjectUserFromMeeting) {

    for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, msg.userId)
    } yield {
      usersApp2x.handle(msg)
      presentationApp2x.handle(msg, user)
      pollApp2x.handle(msg, user)
      deskshareApp2x.handle(msg, user)
      captionApp2x.handle(msg, user)
    }
  }

}
