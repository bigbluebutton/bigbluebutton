package org.bigbluebutton.core.models

import org.bigbluebutton.core.{ MeetingTestFixtures, UnitSpec }

class RegisteredUsersTests extends UnitSpec with MeetingTestFixtures {

  it should "add a registered user" in {
    val testRegUsers = new RegisteredUsers2x
    testRegUsers.add(du30RegisteredUser)
    testRegUsers.add(mdsRegisteredUser)
    testRegUsers.add(marRegisteredUser)

    assert(testRegUsers.toVector.length == 3)
  }

  it should "find a registered user using token" in {
    val testRegUsers = new RegisteredUsers2x
    testRegUsers.add(du30RegisteredUser)
    testRegUsers.add(mdsRegisteredUser)
    testRegUsers.add(marRegisteredUser)

    assert(testRegUsers.toVector.length == 3)

    RegisteredUsers2x.findWithToken(du30RegisteredUser.authToken, testRegUsers.toVector) match {
      case Some(u) => assert(u.id == du30RegisteredUser.id)
      case None => fail("Failed to find user.")
    }
  }

  it should "find a registered user using id" in {
    val testRegUsers = new RegisteredUsers2x
    testRegUsers.add(du30RegisteredUser)
    testRegUsers.add(mdsRegisteredUser)
    testRegUsers.add(marRegisteredUser)

    assert(testRegUsers.toVector.length == 3)

    RegisteredUsers2x.findWithUserId(du30RegisteredUser.id, testRegUsers.toVector) match {
      case Some(u) => assert(u.id == du30RegisteredUser.id)
      case None => fail("Failed to find user.")
    }
  }

  it should "remove a registered user using id" in {
    val testRegUsers = new RegisteredUsers2x
    testRegUsers.add(du30RegisteredUser)
    testRegUsers.add(mdsRegisteredUser)
    testRegUsers.add(marRegisteredUser)

    assert(testRegUsers.toVector.length == 3)

    val regUser4 = testRegUsers.remove(du30RegisteredUser.id) match {
      case Some(u) => assert(u.id == du30RegisteredUser.id)
      case None => fail("Failed to find user.")
    }

    assert(testRegUsers.toVector.length == 2)
  }

  // ====================================
  it should "add a user" in {
    val users = new Users3x
    users.save(du30User)
    users.save(mdsUser)
    users.save(marUser)

    assert(users.toVector.length == 3)
  }

  it should "find a user using id" in {
    val users = new Users3x
    users.save(du30User)
    users.save(mdsUser)
    users.save(marUser)

    Users3x.findWithId(du30RegisteredUser.id, users.toVector) match {
      case Some(u) => assert(u.id == du30RegisteredUser.id)
      case None => fail("Failed to find user.")
    }
  }

  it should "find a user using external id" in {
    val users = new Users3x
    users.save(du30User)
    users.save(mdsUser)
    users.save(marUser)

    Users3x.findWithExtId(du30RegisteredUser.extId, users.toVector) match {
      case Some(u) => assert(u.id == du30RegisteredUser.id)
      case None => fail("Failed to find user.")
    }
  }

  it should "remove a user using id" in {
    val users = new Users3x
    users.save(du30User)
    users.save(mdsUser)
    users.save(marUser)

    users.remove(du30RegisteredUser.id) match {
      case Some(u) => assert(u.id == du30RegisteredUser.id)
      case None => fail("Failed to find user.")
    }

    assert(users.toVector.length == 2)
  }

  it should "have one user with moderator role" in {
    val users = new Users3x
    users.save(du30User)
    users.save(mdsUser)
    users.save(marUser)

    val mods = Users3x.findModerators(users.toVector)
    assert(mods.length == 1)
  }

  it should "have one user with presenter role" in {
    val users = new Users3x
    users.save(du30User)
    users.save(mdsUser)
    users.save(marUser)

    val pres = Users3x.findPresenters(users.toVector)
    assert(pres.length == 1)
  }

}