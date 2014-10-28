package org.bigbluebutton.core.apps.users

import org.testng.annotations.BeforeClass
import org.testng.annotations.Test
import org.testng.Assert._
import org.bigbluebutton.core.api.Role._
import org.bigbluebutton.core.api.UserVO
import org.bigbluebutton.core.api.VoiceUser
import org.bigbluebutton.core.api.Permissions

class UsersModelTests {
  val model = new UsersModel
  val voiceUser = new VoiceUser("vuser1", "user1", 
                      "Asyong Aksaya", "+639175558624",
                      joined = true, locked = false, 
                      muted = false, talking = false)
  val perm = new Permissions
    
  val  userVo = new UserVO("user1", "euser1", name = "Asyong Aksaya", 
                   role = MODERATOR, raiseHand = false, 
                   presenter = true, hasStream = false, 
                   locked = false, webcamStream = "", 
                   phoneUser = false, voiceUser = voiceUser,
                   listenOnly = false, permissions = perm)
  
  @BeforeClass
  def setUp() {
	  model.addUser(userVo) 
  }
	 
  @Test(groups = Array[String]( "unit" ))
  def addUserTest(){	  
	  assert(model.numUsers == 1, "Number of users should be 1")
	  model.getUser("user1") match {
	    case Some(user) => assert(user.userID == "user1", "User id does not match")
	    case None => fail("Should have returned a valid user")
	  }
  }
}