package org.bigbluebutton.core

import scala.actors.Actor
import scala.actors.Actor._
import scala.collection.mutable.HashMap
import org.bigbluebutton.core.api._
import net.lag.logging.Logger

class BigBlueButtonActor(outGW: MessageOutGateway) extends Actor {
  private val log = Logger.get 

  private var meetings = new HashMap[String, MeetingActor]
 
  log.debug("Starting up BigBlueButton Actor")
  
  def act() = {
	loop {
		react {
	      case createMeeting: CreateMeeting => handleCreateMeeting(createMeeting)
	      case destroyMeeting: DestroyMeeting => handleDestroyMeeting(destroyMeeting)
	      case keepAliveMessage: KeepAliveMessage => handleKeepAliveMessage(keepAliveMessage)
	      case voiceUserJoined: VoiceUserJoined => handleVoiceUserJoined(voiceUserJoined)
	      case voiceUserLeft: VoiceUserLeft => handleVoiceUserLeft(voiceUserLeft)
	      case voiceUserMuted: VoiceUserMuted => handleVoiceUserMuted(voiceUserMuted)
	      case voiceUserTalking: VoiceUserTalking => handleVoiceUserTalking(voiceUserTalking)
	      case voiceStartedRecording: VoiceStartedRecording => handleVoiceStartedRecording(voiceStartedRecording)
	      case msg:InMessage => handleMeetingMessage(msg)
	      case _ => // do nothing
	    }
	}
  }
  
  private def getMeetingWithVoiceConfId(id:String):Option[MeetingActor] = {
    var meeting:Option[MeetingActor] = None
    meetings.find((m: (String, MeetingActor)) => m._2.voiceBridge == id) match {
      case Some(mactor) => meeting = Some(mactor._2)
      case None => // do nothing
    }
    
    meeting
  }
  
  private def handleVoiceUserLeft(msg: VoiceUserLeft) {
    getMeetingWithVoiceConfId(msg.voiceConfId) match {
      case Some(meeting) => meeting ! new VoiceUserLeftMessage(meeting.meetingID, msg.user, msg.voiceConfId)
      case None => // do nothing
    }    
  }

  private def handleVoiceUserJoined(msg: VoiceUserJoined) {
    getMeetingWithVoiceConfId(msg.voiceConfId) match {
      case Some(meeting) => {
        meeting ! new VoiceUserJoinedMessage(
            meeting.meetingID, 
            msg.user, msg.voiceConfId, 
            msg.callerIdNum, 
            msg.callerIdName, 
            msg.muted, msg.speaking)
      }
      case None => // do nothing
    }    
  }

  private def handleVoiceUserMuted(msg: VoiceUserMuted) {
    getMeetingWithVoiceConfId(msg.voiceConfId) match {
      case Some(meeting) => {
        meeting ! new VoiceUserMutedMessage(meeting.meetingID, msg.user, msg.voiceConfId, msg.muted)
      }
      case None => // do nothing
    }    
  }

  private def handleVoiceUserTalking(msg: VoiceUserTalking) {
    getMeetingWithVoiceConfId(msg.voiceConfId) match {
      case Some(meeting) => {
        meeting ! new VoiceUserTalkingMessage(meeting.meetingID, msg.user, msg.voiceConfId, msg.talking)
      }
      case None => // do nothing
    }    
  }
  
  private def handleVoiceStartedRecording(msg: VoiceStartedRecording) {
    getMeetingWithVoiceConfId(msg.voiceConfId) match {
      case Some(meeting) => {
        meeting ! new VoiceStartedRecordingMessage(meeting.meetingID, msg.voiceConfId, msg.filename, msg.timestamp, msg.record)
      }
      case None => // do nothing
    }    
  }
  
  private def handleMeetingMessage(msg: InMessage):Unit = {
    meetings.get(msg.meetingID) match {
      case None => // do nothing
      case Some(m) => m ! msg
    }
  }

  private def handleKeepAliveMessage(msg: KeepAliveMessage):Unit = {
    outGW.send(new KeepAliveMessageReply(msg.aliveID))
  }
  
  private def handleDestroyMeeting(msg: DestroyMeeting) {
    meetings.get(msg.meetingID) match {
      case None => // do nothing
      case Some(m) => {
        outGW.send(new MeetingEnded(m.meetingID, m.recorded, m.voiceBridge))
        m ! StopMeetingActor
        meetings -= msg.meetingID
      }
    }    
  }
  
  private def handleCreateMeeting(msg: CreateMeeting):Unit = {
    meetings.get(msg.meetingID) match {
      case None => {
    	  var m = new MeetingActor(msg.meetingID, msg.recorded, msg.voiceBridge, outGW)
    	  m.start
    	  meetings += m.meetingID -> m
    	  outGW.send(new MeetingCreated(m.meetingID, m.recorded, m.voiceBridge))
    	  
    	  m ! new InitializeMeeting(m.meetingID, m.recorded)
      }
      case Some(m) => // do nothing
    }
  }
  
}
