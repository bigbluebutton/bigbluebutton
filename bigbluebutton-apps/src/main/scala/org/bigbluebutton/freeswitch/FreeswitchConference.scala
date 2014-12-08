package org.bigbluebutton.freeswitch

import org.bigbluebutton.core.api.UserVO
import org.bigbluebutton.core.util._

class FreeswitchConference(val conferenceNum: String, 
                           val meetingId: String,
                           val recorded: Boolean) extends LogHelper {

  private var users = new scala.collection.immutable.HashMap[String, UserVO]
  
  private var recording:Boolean = false
  
  def addUser(user: UserVO) {
    users += user.userID -> user
  }
  
  def removeUser(user: UserVO) {
    users -= user.userID
  }

  def getWebUserUsingExtId(webUserId: String):Option[UserVO] = {
    users.values find {u => 
      (u.externUserID == webUserId)    
    }  
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
  
  def recordingStarted() {
    recording = true;
  }
  
  def recordingStopped() {
    recording = false
  }
  
  def isRecording():Boolean = {
    recording
  }
}