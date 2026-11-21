package org.bigbluebutton.core.models

import org.scalatest.flatspec.AnyFlatSpec

class RegisteredUsersSpec extends AnyFlatSpec {

  // Registers through save rather than RegisteredUsers.add, which also writes to the database.
  private def joinUser(users: RegisteredUsers, userId: String, extId: String): Unit = {
    val regUser = RegisteredUsers.create("test-meeting", userId, extId, userId, "", "", Roles.VIEWER_ROLE,
      s"auth-$userId", Vector(s"session-$userId"), "", "", "#000000", bot = false, guest = false,
      authenticated = true, GuestStatus.ALLOW, excludeFromDashboard = false, "", "", Map.empty, Map.empty,
      loggedOut = false)
    users.save(regUser.copy(joined = true))
  }

  behavior of "RegisteredUsers.numUniqueJoinedUsers"

  it should "count each joined external user once" in {
    val users = new RegisteredUsers
    joinUser(users, "w_1", "ext-1")
    joinUser(users, "w_2", "ext-1")
    joinUser(users, "w_3", "ext-2")

    assert(RegisteredUsers.numUniqueJoinedUsers(users) == 2)
  }

  it should "not count a user removed from the meeting" in {
    val users = new RegisteredUsers
    joinUser(users, "w_1", "ext-1")
    joinUser(users, "w_2", "ext-2")

    RegisteredUsers.eject("w_2", users, ban = false)

    assert(RegisteredUsers.numUniqueJoinedUsers(users) == 1)
  }

  it should "not count a user banned from the meeting" in {
    val users = new RegisteredUsers
    joinUser(users, "w_1", "ext-1")
    joinUser(users, "w_2", "ext-2")

    RegisteredUsers.eject("w_2", users, ban = true)

    assert(RegisteredUsers.numUniqueJoinedUsers(users) == 1)
  }
}
