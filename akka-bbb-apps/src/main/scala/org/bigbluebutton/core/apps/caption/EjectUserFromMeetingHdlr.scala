package org.bigbluebutton.core.apps.caption

import org.bigbluebutton.core.api._
import org.bigbluebutton.core.models.{ UserState, Users2x }

trait EjectUserFromMeetingHdlr {
  this: CaptionApp2x =>

  def handle(msg: EjectUserFromMeeting, userToEject: UserState) {
    // Unassign owner when user logs out
    log.warning("TODO: Unassign transcript owner when they log out")
    /*
    for {
      transcript <- checkCaptionOwnerLogOut(userToEject.intId)
    } yield {
      // Need to figure out how to send the update out
    }
    */
  }
}
