package org.bigbluebutton.freeswitch

import org.bigbluebutton.webconference.voice.IVoiceConferenceService
import org.bigbluebutton.core.api._
import org.bigbluebutton.webconference.voice.FreeswitchConferenceEventListener

class FreeswitchConferenceService(fsproxy: FreeswitchManagerProxy, 
                             fsListener: FreeswitchConferenceEventListener) 
                             extends IVoiceConferenceService
                             with OutMessageListener2 {

  fsListener.setVoiceConferenceService(this)
  
  var bbbInGW: IBigBlueButtonInGW = _
  var fsActor: FreeswitchConferenceActor = _
  
  def setIBigBlueButtonInGW(inGW: IBigBlueButtonInGW) {
      bbbInGW = inGW
      fsActor = new FreeswitchConferenceActor(fsproxy, bbbInGW)
  }
  
  def handleMessage(msg: IOutMessage) {
	  msg match {
	    case msg: MeetingCreated => handleMeetingCreated(msg)
	    case _ => // do nothing
	  }
  }
  
  private def handleMeetingCreated(msg: MeetingCreated) {
    fsActor ! msg
  }
  
  
  def voiceUserJoined(userId: String, webUserId: String, conference: String, 
			          callerIdNum: String, callerIdName: String,
			          muted: java.lang.Boolean, talking: java.lang.Boolean) {
    
    val vuj = new FsVoiceUserJoined(userId, webUserId, 
                             conference, callerIdNum, 
                             callerIdName, muted, 
                             talking)
    fsActor ! vuj
  }
  
  def voiceUserLeft(conference: String, userId: String) {
    val vul = new FsVoiceUserLeft(userId, conference)
    fsActor ! vul
  }
  
  def voiceUserLocked(conference: String, userId: String, locked: java.lang.Boolean) {
    val vul = new FsVoiceUserLocked(userId, conference, locked)
    fsActor ! vul    
  }
  
  def voiceUserMuted(conference: String, userId: String, muted: java.lang.Boolean) {
     val vum = new FsVoiceUserMuted(userId, conference, muted)
    fsActor ! vum   
  }
  
  def voiceUserTalking(conference: String, userId: String, talking: java.lang.Boolean) {
     val vut = new FsVoiceUserTalking(userId, conference, talking)
    fsActor ! vut   
  }
}