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
      fsActor.start
  }
  
  def handleMessage(msg: IOutMessage) {
	  msg match {
	    case msg: MeetingCreated                => handleMeetingCreated(msg)
	    case msg: MeetingEnded                  => handleMeetingEnded(msg)
	    case msg: MeetingDestroyed              => handleMeetingDestroyed(msg)
	    case msg: UserJoined                    => handleUserJoined(msg)
	    case msg: UserLeft                      => handleUserLeft(msg)
	    case msg: MuteVoiceUser                 => handleMuteVoiceUser(msg)
	    case msg: EjectVoiceUser                => handleEjectVoiceUser(msg)
	    case msg: UserJoinedVoice               => handleUserJoinedVoice(msg)
	    case msg: UserLeftVoice                 => handleUserLeftVoice(msg)
	    case msg: EjectAllVoiceUsers            => handleEjectAllVoiceUsers(msg)
	    case _ => // do nothing
	  }
  }

  private def handleUserLeftVoice(msg: UserLeftVoice) {
    fsActor ! msg
  }
    
  private def handleUserJoinedVoice(msg: UserJoinedVoice) {
    fsActor ! msg
  }
  
  private def handleMuteVoiceUser(msg: MuteVoiceUser) {
    fsActor ! msg
  }
  
  private def handleEjectVoiceUser(msg: EjectVoiceUser) {
    fsActor ! msg
  }
  
  private def handleUserLeft(msg: UserLeft) {
    fsActor ! msg
  }
  
  private def handleUserJoined(msg: UserJoined) {
    fsActor ! msg
  }
  
  private def handleMeetingCreated(msg: MeetingCreated) {
    fsActor ! msg
  }
  
  private def handleMeetingEnded(msg: MeetingEnded) {
    fsActor ! msg
  }
    
  private def handleMeetingDestroyed(msg: MeetingDestroyed) {
    fsActor ! msg
  }
    
  
  private def handleEjectAllVoiceUsers(msg: EjectAllVoiceUsers) {
    fsActor ! msg
  }
  
  def voiceStartedRecording(conference: String, recordingFile: String, 
                            timestamp: String, recording: java.lang.Boolean) {
    val fsRec = new FsRecording(conference, recordingFile, timestamp, recording)
    fsActor ! fsRec
  }
  
  def voiceUserJoined(userId: String, webUserId: String, conference: String, 
			          callerIdNum: String, callerIdName: String,
			          muted: java.lang.Boolean, talking: java.lang.Boolean) {
//    println("******** FreeswitchConferenceService received voiceUserJoined vui=[" + userId + "] wui=[" + webUserId + "]")
    val vuj = new FsVoiceUserJoined(userId, webUserId, 
                             conference, callerIdNum, 
                             callerIdName, muted, 
                             talking)
    fsActor ! vuj
  }
  
  def voiceUserLeft(userId: String, conference: String) {
//    println("******** FreeswitchConferenceService received voiceUserLeft vui=[" + userId + "] conference=[" + conference + "]")
    val vul = new FsVoiceUserLeft(userId, conference)
    fsActor ! vul
  }
  
  def voiceUserLocked(userId: String, conference: String, locked: java.lang.Boolean) {
    val vul = new FsVoiceUserLocked(userId, conference, locked)
    fsActor ! vul    
  }
  
  def voiceUserMuted(userId: String, conference: String, muted: java.lang.Boolean) {
    println("******** FreeswitchConferenceService received voiceUserMuted vui=[" + userId + "] muted=[" + muted + "]")
    val vum = new FsVoiceUserMuted(userId, conference, muted)
    fsActor ! vum   
  }
  
  def voiceUserTalking(userId: String, conference: String, talking: java.lang.Boolean) {
    println("******** FreeswitchConferenceService received voiceUserTalking vui=[" + userId + "] talking=[" + talking + "]")
     val vut = new FsVoiceUserTalking(userId, conference, talking)
    fsActor ! vut   
  }
}