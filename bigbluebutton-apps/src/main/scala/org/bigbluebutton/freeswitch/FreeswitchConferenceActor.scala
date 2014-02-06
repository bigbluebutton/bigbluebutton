package org.bigbluebutton.freeswitch

import scala.actors.Actor
import scala.actors.Actor._
import org.bigbluebutton.core.api._

case class FsVoiceUserJoined(userId: String, webUserId: String, 
                             conference: String, callerIdNum: String, 
                             callerIdName: String, muted: Boolean, 
                             speaking: Boolean)
               
case class FsVoiceUserLeft(userId: String, conference: String)
case class FsVoiceUserLocked(userId: String, conference: String, locked: Boolean)
case class FsVoiceUserMuted(userId: String, conference: String, muted: Boolean)
case class FsVoiceUserTalking(userId: String, conference: String, talking: Boolean)
case class FsRecording(conference: String, recording: Boolean)

class FreeswitchConferenceActor(fsproxy: FreeswitchManagerProxy, bbbInGW: IBigBlueButtonInGW) extends Actor {

  private var confs = new scala.collection.immutable.HashMap[String, FreeswitchConference]
  
  def act() = {
	loop {
	  react {
	    case msg: MeetingCreated => handleMeetingCreated(msg)
	    case msg: MeetingEnded => handleMeetingEnded(msg)
	    case msg: UserJoined => handleUserJoined(msg)
	    case msg: UserLeft => handleUserLeft(msg)
	    case msg: MuteVoiceUser => handleMuteVoiceUser(msg)
	    case msg: EjectVoiceUser => handleEjectVoiceUser(msg)
	    case msg: StartRecording => handleStartRecording(msg)
	    case msg: StopRecording => handleStopRecording(msg)
	    case msg: FsRecording => handleFsRecording(msg)
	    case msg: FsVoiceUserJoined => handleFsVoiceUserJoined(msg)
	    case msg: FsVoiceUserLeft => handleFsVoiceUserLeft(msg)
	    case msg: FsVoiceUserLocked => handleFsVoiceUserLocked(msg)
	    case msg: FsVoiceUserMuted => handleFsVoiceUserMuted(msg)
	    case msg: FsVoiceUserTalking => handleFsVoiceUserTalking(msg)
	    case _ => // do nothing
	  }
	}
  }  
  
  private def handleMeetingCreated(msg: MeetingCreated) {
    if (! confs.contains(msg.meetingID)) {
      val fsconf = new FreeswitchConference(msg.meetingID, 
                                            msg.voiceBridge,
                                            msg.recorded)
      confs += fsconf.meetingId -> fsconf
    }
    
    fsproxy.getUsers(msg.voiceBridge)
  }
  
  private def handleMeetingEnded(msg: MeetingEnded) {
    val fsconf = confs.values find (c => c.meetingId == msg.meetingID)
    
    fsconf foreach (fc => {
      fsproxy.ejectUsers(fc.conferenceNum)
      confs -= fc.meetingId
    })
  }
  
  private def handleUserJoined(msg: UserJoined) {
    val fsconf = confs.values find (c => c.meetingId == msg.meetingID)
    
    fsconf foreach (fc => {
      fc.addUser(msg.user)
      if (fc.numUsers == 1 && fc.recorded) {
        fsproxy.startRecording(fc.conferenceNum, fc.meetingId)
      }
    })
  }
  
  private def handleUserLeft(msg: UserLeft) {
    val fsconf = confs.values find (c => c.meetingId == msg.meetingID)
    
    fsconf foreach (fc => {
      fc.removeUser(msg.user)
      if (fc.numUsers == 0 && fc.recorded) {
        fsproxy.stopRecording(fc.conferenceNum)
      }
    })
  }
  
  private def handleMuteVoiceUser(msg: MuteVoiceUser) {
    val fsconf = confs.values find (c => c.meetingId == msg.meetingID)
    
    fsconf foreach (fc => {
      val user = fc.getVoiceUser(msg.userId)
      user foreach (u => {
        fsproxy.muteUser(fc.conferenceNum, u.voiceUser.userId, msg.mute)
      })
    })    
  }
  
  private def handleEjectVoiceUser(msg: EjectVoiceUser) {
    val fsconf = confs.values find (c => c.meetingId == msg.meetingID)
    
    fsconf foreach (fc => {
      val user = fc.getVoiceUser(msg.userId)
      user foreach (u => {
        fsproxy.ejectUser(fc.conferenceNum, u.voiceUser.userId)
      })
    })    
  }
    
  private def handleStartRecording(msg: StartRecording) {
    
  }
    
  private def handleStopRecording(msg: StopRecording) {
    
  }  
  
  private def handleFsRecording(msg: FsRecording) {
    
  }
  
  private def sendNonWebUserJoined(meetingId: String, webUserId: String, 
      msg: FsVoiceUserJoined) {
     bbbInGW.voiceUserJoined(meetingId, msg.userId, 
	              webUserId, msg.conference, msg.callerIdNum, msg.callerIdName,
	              msg.muted, msg.speaking)    
  }
  
  private def handleFsVoiceUserJoined(msg: FsVoiceUserJoined) {
    val fsconf = confs.values find (c => c.conferenceNum == msg.conference)
    
    fsconf foreach (fc => {
	  fc.getWebUser(msg.webUserId) match {
	   case Some(user) => sendNonWebUserJoined(fc.meetingId, msg.webUserId, msg)
	   case None => sendNonWebUserJoined(fc.meetingId, msg.userId, msg)
	  }
    })
  }
  
  private def handleFsVoiceUserLeft(msg: FsVoiceUserLeft) {
    val fsconf = confs.values find (c => c.conferenceNum == msg.conference)
    
    fsconf foreach (fc => {
      val user = fc.getVoiceUser(msg.userId) 
      user foreach (u => bbbInGW.voiceUserLeft(fc.meetingId, msg.userId))
    })
  }
  
  private def handleFsVoiceUserLocked(msg: FsVoiceUserLocked) {
    val fsconf = confs.values find (c => c.conferenceNum == msg.conference)
    
    fsconf foreach (fc => {
      val user = fc.getVoiceUser(msg.userId)   
      user foreach (u => bbbInGW.voiceUserLocked(fc.meetingId, msg.userId, msg.locked))
    })    
  }
  
  private def handleFsVoiceUserMuted(msg: FsVoiceUserMuted) {
    val fsconf = confs.values find (c => c.conferenceNum == msg.conference)
    
    fsconf foreach (fc => {
      val user = fc.getVoiceUser(msg.userId) 
      user foreach (u => bbbInGW.voiceUserMuted(fc.meetingId, msg.userId, msg.muted))
    })      
  }
  
  private def handleFsVoiceUserTalking(msg: FsVoiceUserTalking) {
    val fsconf = confs.values find (c => c.conferenceNum == msg.conference)
    
    fsconf foreach (fc => {
      val user = fc.getVoiceUser(msg.userId) 
      user foreach (u => bbbInGW.voiceUserTalking(fc.meetingId, msg.userId, msg.talking))
    })      
  }
}