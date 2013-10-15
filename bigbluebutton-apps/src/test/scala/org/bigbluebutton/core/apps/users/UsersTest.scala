package org.bigbluebutton.core.apps.users

import org.testng.annotations.BeforeClass
import org.testng.annotations.Test
import org.testng.Assert
import org.bigbluebutton.core.models.UserV
import org.bigbluebutton.core.api.Role._

class UsersTest {
  
  @BeforeClass
  def setUp() {}
	 
  @Test(groups = Array[String]("unit"))
  def addUserTest() {	 
    val users = new Users
    users.add(UserV("1", "ext1", "Juan Tamad", MODERATOR)) 
	assert(users.size == 1, "Number of users should be 1")
  }
  
  @Test(groups = Array[String]("unit"))
  def removeUserTest() {
    val users = new Users
    users.add(UserV("1", "ext1", "Juan Tamad", MODERATOR)) 
	assert(users.size == 1, "Number of users should be 1")
  }

  @Test(groups = Array[String]("unit"))
  def getUserWithUserTest() {
    val users = new Users
    users.add(UserV("1", "ext1", "Juan Tamad", MODERATOR)) 
    users.get("1") match {
      case Some(u) => Assert.assertTrue(u.id == "1", "Found the user.")
      case None => Assert.fail("There should have been a user.")
    }
  }
 
  @Test(groups = Array[String]("unit"))
  def getUserWithNoUserTest() {
    val users = new Users
    users.add(UserV("1", "ext1", "Juan Tamad", MODERATOR)) 
    users.get("2") match {
      case Some(u) => Assert.fail("There shouldn't be any user.")
      case None => // passed
    }
	
  }
    
  @Test(groups = Array[String]("unit"))
  def allUserTest() {
    val users = new Users
    users.add(UserV("1", "ext1", "Juan Tamad", MODERATOR)) 
    users.add(UserV("2", "ext2", "Asyong Aksaya", VIEWER)) 
	assert(users.size == 2, "Number of users should be 2")
	val u = users.all
	assert(u.size == 2, "Number of users should be 2")
  }  
  
  @Test(groups = Array[String]("unit"))
  def allUserCheckIfReturningCorrectValueTest() {
    val users = new Users
    users.add(UserV("2", "ext2", "Asyong Aksaya", VIEWER)) 
	assert(users.size == 1, "Number of users should be 2")
	val u = users.all
	assert(u.size == 1, "Number of users should be 2")
    assert(u(0).extId == "ext2", "Failed to return correct external id")
  }
}