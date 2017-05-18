package org.bigbluebutton.api2.meeting

import org.bigbluebutton.api2.domain.{RegisteredUser2, User2}

object RunningMeeting {

}

class RunningMeeting(val meetingId: String) {

  private var registeredUsers = new collection.immutable.HashMap[String, RegisteredUser2]
}
