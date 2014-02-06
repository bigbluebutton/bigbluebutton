package org.bigbluebutton.freeswitch

import org.bigbluebutton.webconference.voice.freeswitch.FreeswitchApplication

class FreeswitchManagerProxy(fsApp: FreeswitchApplication) {

  def getUsers(conference: String) {
    fsApp.populateRoom(conference)
  }
  
  def ejectUsers(conference: String) {
    fsApp.ejectAll(conference)
  }
  
  def muteUser(conference: String, userId: String, mute: Boolean) {
    fsApp.mute(conference, userId, mute)
  }
  
  def ejectUser(conference: String, userId: String ) {
    fsApp.eject(conference, userId)
  }
  
  def startRecording(conference: String, meetingId: String) {
    fsApp.record(conference, meetingId)
  }
  
  def stopRecording(conference: String) {
    
  }
}