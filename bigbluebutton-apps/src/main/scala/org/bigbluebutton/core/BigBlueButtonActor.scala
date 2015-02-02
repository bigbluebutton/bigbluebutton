package org.bigbluebutton.core

import scala.actors.Actor
import scala.actors.Actor._
import scala.collection.mutable.HashMap
import org.bigbluebutton.core.api._
import org.bigbluebutton.core.util._

class BigBlueButtonActor(outGW: MessageOutGateway) extends Actor with LogHelper {

  private var meetings = new HashMap[String, MeetingActor]
  
 
  def act() = {
	loop {
		react {
	      case msg: CreateMeeting                 => handleCreateMeeting(msg)
	      case msg: DestroyMeeting                => handleDestroyMeeting(msg)
	      case msg: KeepAliveMessage              => handleKeepAliveMessage(msg)
          case msg: GetAllMeetingsRequest         => handleGetAllMeetingsRequest(msg)
	      case msg: InMessage                     => handleMeetingMessage(msg)
	      case _ => // do nothing
	    }
	  }
  }
  

  private def handleMeetingMessage(msg: InMessage):Unit = {
    msg match {
      case ucm: UserConnectedToGlobalAudio => {
        val m = meetings.values.find( m => m.voiceBridge == ucm.voiceConf)
        m foreach {mActor => mActor ! ucm}
      }
      case udm: UserDisconnectedFromGlobalAudio => {
        val m = meetings.values.find( m => m.voiceBridge == udm.voiceConf)
        m foreach {mActor => mActor ! udm}        
      }
      case allOthers => {
		    meetings.get(allOthers.meetingID) match {
		      case None => handleMeetingNotFound(allOthers)
		      case Some(m) => {
		       // log.debug("Forwarding message [{}] to meeting [{}]", msg.meetingID)
		        m ! allOthers
		      }
		    }        
      }
    }
  }
  
  private def handleMeetingNotFound(msg: InMessage) {
    msg match {
      case vat:ValidateAuthToken => {
        logger.info("No meeting [" + vat.meetingID + "] for auth token [" + vat.token + "]")
        outGW.send(new ValidateAuthTokenReply(vat.meetingID, vat.userId, vat.token, false, vat.correlationId, vat.sessionId))
      }
      case _ => {
        logger.info("No meeting [" + msg.meetingID + "] for message type [" + msg.getClass() + "]")
        // do nothing
      }
    }
  }

  private def handleKeepAliveMessage(msg: KeepAliveMessage):Unit = {
    outGW.send(new KeepAliveMessageReply(msg.aliveID))
  }
    
  private def handleDestroyMeeting(msg: DestroyMeeting) {
    logger.info("BBBActor received DestroyMeeting message for meeting id [" + msg.meetingID + "]")
    meetings.get(msg.meetingID) match {
      case None => println("Could not find meeting id[" + msg.meetingID + "] to destroy.")
      case Some(m) => {
        m ! StopMeetingActor
        meetings -= msg.meetingID    
        logger.info("Kick everyone out on meeting id[" + msg.meetingID + "].")
        outGW.send(new EndAndKickAll(msg.meetingID, m.recorded))
        
        logger.info("Destroyed meeting id[" + msg.meetingID + "].")
        outGW.send(new MeetingDestroyed(msg.meetingID))
      }
    }
  }
  
  private def handleCreateMeeting(msg: CreateMeeting):Unit = {
    meetings.get(msg.meetingID) match {
      case None => {
        logger.info("New meeting create request [" + msg.meetingName + "]")
    	  var m = new MeetingActor(msg.meetingID, msg.externalMeetingID, msg.meetingName, msg.recorded, 
    	                  msg.voiceBridge, msg.duration, 
    	                  msg.autoStartRecording, msg.allowStartStopRecording,
    	                  outGW)
    	  m.start
    	  meetings += m.meetingID -> m
    	  outGW.send(new MeetingCreated(m.meetingID, m.externalMeetingID, m.recorded, m.meetingName, m.voiceBridge, msg.duration))
    	  
    	  m ! new InitializeMeeting(m.meetingID, m.recorded)
    	  m ! "StartTimer"
      }
      case Some(m) => {
        logger.info("Meeting already created [" + msg.meetingName + "]")
        // do nothing
      }
    }
  }

  private def handleGetAllMeetingsRequest(msg: GetAllMeetingsRequest) {
    var len = meetings.keys.size
    println("meetings.size=" + meetings.size)
    println("len_=" + len)

    val set = meetings.keySet
    val arr : Array[String] = new Array[String](len)
    set.copyToArray(arr)
    val resultArray : Array[MeetingInfo] = new Array[MeetingInfo](len)

    for(i <- 0 until arr.length) {
      val id = arr(i)
      val duration = meetings.get(arr(i)).head.getDuration()
      val name = meetings.get(arr(i)).head.getMeetingName()
      val recorded = meetings.get(arr(i)).head.getRecordedStatus()
      val voiceBridge = meetings.get(arr(i)).head.getVoiceBridgeNumber()

      var info = new MeetingInfo(id, name, recorded, voiceBridge, duration)
      resultArray(i) = info

      //remove later
      println("for a meeting:" + id)
      println("Meeting Name = " + meetings.get(id).head.getMeetingName())
      println("isRecorded = " + meetings.get(id).head.getRecordedStatus())
      println("voiceBridge = " + voiceBridge)
      println("duration = " + duration)

      //send the users
      this ! (new GetUsers(id, "nodeJSapp"))

      //send the presentation
      this ! (new GetPresentationInfo(id, "nodeJSapp", "nodeJSapp"))

      //send chat history
      this ! (new GetChatHistoryRequest(id, "nodeJSapp", "nodeJSapp"))
    }

    outGW.send(new GetAllMeetingsReply(resultArray))
  }

}
