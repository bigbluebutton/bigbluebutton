package org.bigbluebutton.api2.meeting

//import org.bigbluebutton.api2.domain.{RegisteredUsers, Users, UsersCustomData}
import org.bigbluebutton.common2.domain.DefaultProps

object RunningMeeting {
  def apply(meetingId: String, defaultProps: DefaultProps) = new RunningMeeting(meetingId, defaultProps)
}

class RunningMeeting(val meetingId: String, val defaultProps: DefaultProps) {
  // Not used for now. For future when migrating meeting info in akka.
  // private val users = new Users
  // private val registeredUsers = new RegisteredUsers
  // private val usersCustomData = new UsersCustomData
  // private val usersCustomData = new UsersCustomData

}
