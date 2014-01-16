package org.bigbluebutton.freeswitch

import org.bigbluebutton.core.api.UserVO

class FreeswitchConference(val conferenceNum: String, 
                           val meetingId: String,
                           val recorded: Boolean) {

  private var users = new scala.collection.immutable.HashMap[String, UserVO]
  
  def addUser(user: UserVO) {
    
  }
  
  def removeUser(user: UserVO) {
    
  }
  
  def getUser(userId: String):Option[UserVO] = {
    users.values find (u => u.userID == userId)  
  }
  
  def getVoiceUser(userId: String):Option[UserVO] = {
    users.values find (u => u.voiceUser.userId == userId)
  }
  
  def numUsers = users.size
}