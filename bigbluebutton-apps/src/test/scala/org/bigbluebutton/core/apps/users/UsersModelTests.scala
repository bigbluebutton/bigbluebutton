package org.bigbluebutton.core.apps.users

import org.testng.annotations.BeforeClass
import org.testng.annotations.Test
import org.bigbluebutton.core.api.Role._

class UsersModelTests {
  val model = new UsersModel
  
  @BeforeClass
  def setUp() {
	 model.addUser("1", "ext1", "Juan Tamad", MODERATOR) 
  }
	 
  @Test(groups = Array[String]( "unit" ))
  def addUserTest(){	  
	  assert(model.numUsers == 1, "Number of users should be 1")
	  val user = model.getUser("1")
	  assert(user != null, "Should have a user")
	  assert(model.isModerator("1") == true, "User should be moderator")
	  val users = model.getUsers
	  assert(users.length == 1, "Number of users should be 1")
  }
}