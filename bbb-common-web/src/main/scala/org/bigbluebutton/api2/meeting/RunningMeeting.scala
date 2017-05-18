package org.bigbluebutton.api2.meeting

import org.bigbluebutton.api2.domain.{RegisteredUsers, Users, UsersCustomData}

object RunningMeeting {

}

class RunningMeeting(val meetingId: String) {
  private val users = new Users
  private val registeredUsers = new RegisteredUsers
  private val usersCustomData = new UsersCustomData

}
