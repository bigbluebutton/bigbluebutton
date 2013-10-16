package org.bigbluebutton.core.apps.users

import org.testng.annotations.BeforeClass
import org.testng.annotations.Test
import org.testng.Assert
import org.bigbluebutton.core.models.{UserV, Status, CallerId, Voice}
import org.bigbluebutton.core.api.Role._

class UsersTest {
  
  @BeforeClass
  def setUp() {}
	 
  @Test(groups = Array[String]("unit"))
  def addUserTest() {	 
    val users = new Users
    users.add(UserV("1", "ext1", "Juan Tamad", MODERATOR)) 
	assert(users.count == 1, "Number of users should be 1")
  }
  
  @Test(groups = Array[String]("unit"))
  def removeUserTest() {
    val users = new Users
    users.add(UserV("1", "ext1", "Juan Tamad", MODERATOR)) 
	assert(users.count == 1, "Number of users should be 1")
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
	assert(users.count == 2, "Number of users should be 2")
	val u = users.all
	assert(u.size == 2, "Number of users should be 2")
  }  
  
  @Test(groups = Array[String]("unit"))
  def allUserCheckIfReturningCorrectValueTest() {
    val users = new Users
    users.add(UserV("2", "ext2", "Asyong Aksaya", VIEWER)) 
	assert(users.count == 1, "Number of users should be 2")
	val u = users.all
	assert(u.size == 1, "Number of users should be 2")
    assert(u(0).extId == "ext2", "Failed to return correct external id")
  }
  
  @Test(groups = Array[String]("unit"))
  def getPresenterHasPresenterTest() {
    val users = new Users
    users.add(UserV("1", "ext1", "Juan Tamad", MODERATOR, status = Status(isPresenter=true))) 
    users.add(UserV("2", "ext2", "Asyong Aksaya", VIEWER)) 
	assert(users.count == 2, "Number of users should be 2")
	users.getPresenter() match {
      case Some(u) => Assert.assertTrue(u.id == "1", "Got a wrong presenter")
      case None => Assert.fail("Should have returned a presenter.")
    }   
  }
  
  @Test(groups = Array[String]("unit"))
  def getPresenterNoPresenterTest() {
    val users = new Users
    users.add(UserV("1", "ext1", "Juan Tamad", MODERATOR)) 
    users.add(UserV("2", "ext2", "Asyong Aksaya", VIEWER)) 
	assert(users.count == 2, "Number of users should be 2")
	users.getPresenter() match {
      case Some(u) => Assert.fail("Should have returned no presenter.")
      case None => // passed
    }
  }
  
  @Test(groups = Array[String]("unit"))
  def makeEveryoneNotPresenterTest() {
    val users = new Users
    users.add(UserV("1", "ext1", "Juan Tamad", MODERATOR, status = Status(isPresenter=true))) 
    users.add(UserV("2", "ext2", "Asyong Aksaya", VIEWER)) 
	assert(users.count == 2, "Number of users should be 2")
	users.makeEveryoneNotPresenter()
	users.getPresenter() match {
      case Some(u) => Assert.fail("Should have returned no presenter.")
      case None => // passed
    }   
  }
  
  @Test(groups = Array[String]("unit"))
  def makeUserPresenterTest() {
    val users = new Users
    users.add(UserV("1", "ext1", "Juan Tamad", MODERATOR)) 
    users.add(UserV("2", "ext2", "Asyong Aksaya", VIEWER)) 
	assert(users.count == 2, "Number of users should be 2")
	users.makePresenter("1") match {
      case Some(u) => Assert.assertTrue(u.id == "1", "Got a wrong presenter")
      case None => Assert.fail("Should have returned a presenter.")
    }   
  }  
  
  @Test(groups = Array[String]("unit"))
  def moderatorCountSuccessTest() {
    val users = new Users
    users.add(UserV("1", "ext1", "Juan Tamad", MODERATOR)) 
    users.add(UserV("2", "ext2", "Asyong Aksaya", VIEWER)) 
	assert(users.count == 2, "Number of users should be 2")
	val numModerators = users.moderatorCount
	assert(numModerators == 1, "There should only be one moderator")
  }
  
  @Test(groups = Array[String]("unit"))
  def moderatorCountFailTest() {
    val users = new Users
    users.add(UserV("1", "ext1", "Juan Tamad", MODERATOR)) 
    users.add(UserV("2", "ext2", "Asyong Aksaya", MODERATOR)) 
	assert(users.count == 2, "Number of users should be 2")
	val numModerators = users.moderatorCount
	Assert.assertFalse(numModerators == 1, "There should only be one moderator")
  } 

  @Test(groups = Array[String]("unit"))
  def getVoiceUserHasUserTest() {
    val users = new Users
    users.add(UserV("1", "ext1", "Juan Tamad", MODERATOR, voice=Voice(id="v1"))) 
    users.add(UserV("2", "ext2", "Asyong Aksaya", MODERATOR, voice=Voice(id="v2"))) 
	users.getVoiceUser("v1") match {
      case Some(u) => Assert.assertTrue(u.id == "1", "Failed to find voice user.")
      case None => Assert.fail("Failed to get user.")
    }
  }

  @Test(groups = Array[String]("unit"))
  def getVoiceUserNoUserTest() {
    val users = new Users
    users.add(UserV("1", "ext1", "Juan Tamad", MODERATOR, voice=Voice(id="v1"))) 
    users.add(UserV("2", "ext2", "Asyong Aksaya", MODERATOR, voice=Voice(id="v2"))) 
	users.getVoiceUser("v3") match {
      case Some(u) => Assert.fail("Should have returned no user.")
      case None => // passed
    }
  }
    
  @Test(groups = Array[String]("unit"))
  def muteUserTest() {
    val users = new Users
    users.add(UserV("1", "ext1", "Juan Tamad", MODERATOR, voice=Voice(id="v1"))) 
    users.add(UserV("2", "ext2", "Asyong Aksaya", MODERATOR, voice=Voice(id="v2"))) 
	users.mute("v1") match {
      case Some(u) => Assert.assertTrue(u.voice.muted, "User should be muted.")
      case None => Assert.fail("Failed to get user.")
    }
  }
  
  @Test(groups = Array[String]("unit"))
  def umuteUserTest() {
    val users = new Users
    users.add(UserV("1", "ext1", "Juan Tamad", MODERATOR, voice=Voice(id="v1"))) 
    users.add(UserV("2", "ext2", "Asyong Aksaya", MODERATOR, voice=Voice(id="v2"))) 
	users.unmute("v1") match {
      case Some(u) => Assert.assertFalse(u.voice.muted, "User should be muted.")
      case None => Assert.fail("Failed to get user.")
    }
  }
  
  @Test(groups = Array[String]("unit"))
  def joinedVoiceTest() {
    val users = new Users
    users.add(UserV("1", "ext1", "Juan Tamad", MODERATOR))
    users.add(UserV("2", "ext2", "Asyong Aksaya", MODERATOR, voice=Voice(id="v2", callerId=CallerId("456", "Asyong"))))
    val voiceUser = Voice(hasJoined=true, id="v1", callerId=CallerId("123", "Juan"), muted=false, talking=false, locked=false)
	users.joinedVoice("1", voiceUser) match {
      case Some(u) => Assert.assertTrue(u.id == "1", "Failed to find voice user.")
      case None => Assert.fail("Failed to get user.")
    }
  }
  
  @Test(groups = Array[String]("unit"))
  def leftVoiceTest() {
    val users = new Users
    users.add(UserV("1", "ext1", "Juan Tamad", MODERATOR))
    users.add(UserV("2", "ext2", "Asyong Aksaya", MODERATOR, voice=Voice(id="v2", callerId=CallerId("456", "Asyong"))))
	users.leftVoice("v2") match {
      case Some(u) => Assert.assertTrue(u.id == "2", "Failed to find voice user.")
      case None => Assert.fail("Failed to get user.")
    }
  }
}