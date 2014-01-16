package org.bigbluebutton.freeswitch

import scala.actors.Actor
import scala.actors.Actor._
import org.bigbluebutton.core.api._

case class FsVoiceUserJoined(userId: String, webUserId: Option[String], 
                             conference: String, callerIdNum: String, 
                             callerIdName: String, muted: Boolean, 
                             speaking: Boolean)
               
case class FsVoiceUserLeft(userId: String, conference: String)
case class FsVoiceUserLocked(userId: String, conference: String, locked: Boolean)
case class FsVoiceUserMuted(userId: String, conference: String, muted: Boolean)
case class FsVoiceUserTalking(userId: String, conference: String, talking: Boolean)

class FreeswitchConferenceActor(fsproxy: FreeswitchManagerProxy) extends Actor {

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
	    case msg: FsVoiceUserJoined => handleVoiceUserJoined(msg)
	    case msg: FsVoiceUserLeft => handleVoiceUserLeft(msg)
	    case msg: FsVoiceUserLocked => handleVoiceUserLocked(msg)
	    case msg: FsVoiceUserMuted => handleVoiceUserMuted(msg)
	    case msg: FsVoiceUserTalking => handleVoiceUserTalking(msg)
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
        fsproxy.startRecording(fc.conferenceNum)
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
      val user = fc.getUser(msg.userId)
      user foreach (u => {
        fsproxy.muteUser(fc.conferenceNum, u.voiceUser.userId, msg.mute)
      })
    })    
  }
  
  private def handleEjectVoiceUser(msg: EjectVoiceUser) {
    val fsconf = confs.values find (c => c.meetingId == msg.meetingID)
    
    fsconf foreach (fc => {
      val user = fc.getUser(msg.userId)
      user foreach (u => {
        fsproxy.ejectUser(fc.conferenceNum, u.voiceUser.userId)
      })
    })    
  }
    
  private def handleStartRecording(msg: StartRecording) {
    
  }
    
  private def handleStopRecording(msg: StopRecording) {
    
  }  
  
  private def handleVoiceUserJoined(msg: FsVoiceUserJoined) {
    val fsconf = confs.values find (c => c.conferenceNum == msg.conference)
    
    fsconf foreach (fc => {
      val user = fc.getVoiceUser(msg.userId)
      user foreach (u => {
        //u.voiceUser foreach (v => fsproxy.ejectUser(fc.conferenceNum, v.userId))
      })
    })    
  }
  
  private def handleVoiceUserLeft(msg: FsVoiceUserLeft) {
    
  }
  
  private def handleVoiceUserLocked(msg: FsVoiceUserLocked) {
    
  }
  
  private def handleVoiceUserMuted(msg: FsVoiceUserMuted) {
    
  }
  
  private def handleVoiceUserTalking(msg: FsVoiceUserTalking) {
    
  }
}