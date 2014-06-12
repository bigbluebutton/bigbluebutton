package org.bigbluebutton.freeswitch

import org.bigbluebutton.core.api.UserVO

class FreeswitchConference(val conferenceNum: String, 
                           val meetingId: String,
                           val recorded: Boolean) {

  private var users = new scala.collection.immutable.HashMap[String, UserVO]
  
  def addUser(user: UserVO) {
    users += user.userID -> user
  }
  
  def removeUser(user: UserVO) {
    users -= user.userID
  }
  
  def getWebUser(webUserId: String):Option[UserVO] = {
    users.values find (u => (u.userID == webUserId))  
  }
  
  def getVoiceUser(voiceUserId: String):Option[UserVO] = {
    users.values find (u => u.voiceUser.userId == voiceUserId)
  }
  
  def numUsersInVoiceConference:Int = {
    val joinedUsers = users.values filter (u => u.voiceUser.joined)
    joinedUsers.size
  }
  
  def numUsers = users.size
}