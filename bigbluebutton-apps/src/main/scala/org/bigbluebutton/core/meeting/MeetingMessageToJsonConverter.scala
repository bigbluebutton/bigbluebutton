package org.bigbluebutton.core.meeting

import org.bigbluebutton.core.messaging.Util
import org.bigbluebutton.core.api._
import com.google.gson.Gson
import scala.collection.JavaConverters._

object MeetingMessageToJsonConverter {
  def meetingDestroyedToJson(msg: MeetingDestroyed):String = {    	
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)

    val header = Util.buildHeader(MessageNames.MEETING_DESTROYED_EVENT, msg.version, None)
    Util.buildJson(header, payload)
	}
	
  def keepAliveMessageReplyToJson(msg: KeepAliveMessageReply):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.KEEP_ALIVE_ID, msg.aliveID)

    val header = Util.buildHeader(MessageNames.KEEP_ALIVE_REPLY, msg.version, None)
    Util.buildJson(header, payload)    
  }

  def meetingCreatedToJson(msg:MeetingCreated):String = {
	val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.EXTERNAL_MEETING_ID, msg.externalMeetingID)
    payload.put(Constants.NAME, msg.name)
    payload.put(Constants.RECORDED, msg.recorded)
    payload.put(Constants.VOICE_CONF, msg.voiceBridge)
    payload.put(Constants.DURATION, msg.duration)
    payload.put(Constants.MODERATOR_PASS, msg.moderatorPass)
    payload.put(Constants.VIEWER_PASS, msg.viewerPass)
    payload.put(Constants.CREATE_TIME, msg.createTime)
    payload.put(Constants.CREATE_DATE, msg.createDate)

    val header = Util.buildHeader(MessageNames.MEETING_CREATED, msg.version, None)
    Util.buildJson(header, payload) 
  }

  def meetingEndedToJson(msg:MeetingEnded):String = {
	val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)

    val header = Util.buildHeader(MessageNames.MEETING_ENDED, msg.version, None)
    Util.buildJson(header, payload) 
  }
	
  def voiceRecordingStartedToJson(msg: VoiceRecordingStarted):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded)
    payload.put(Constants.RECORDING_FILE, msg.recordingFile)
    payload.put(Constants.VOICE_CONF, msg.confNum)
    payload.put(Constants.TIMESTAMP, msg.timestamp)
 
    val header = Util.buildHeader(MessageNames.VOICE_RECORDING_STARTED, msg.version, None)
    Util.buildJson(header, payload)
  }
  
  def voiceRecordingStoppedToJson(msg: VoiceRecordingStopped):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded)
    payload.put(Constants.RECORDING_FILE, msg.recordingFile)
    payload.put(Constants.VOICE_CONF, msg.confNum)
    payload.put(Constants.TIMESTAMP, msg.timestamp)

    val header = Util.buildHeader(MessageNames.VOICE_RECORDING_STOPPED, msg.version, None)
    Util.buildJson(header, payload)
  } 
  
  def recordingStatusChangedToJson(msg: RecordingStatusChanged):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded)
    payload.put(Constants.USER_ID, msg.userId)
    payload.put(Constants.RECORDING, msg.recording)

    val header = Util.buildHeader(MessageNames.RECORDING_STATUS_CHANGED, msg.version, None)
    Util.buildJson(header, payload)
  }	
  
  def getRecordingStatusReplyToJson(msg: GetRecordingStatusReply):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded)
    payload.put(Constants.USER_ID, msg.userId)
    payload.put(Constants.RECORDING, msg.recording)

    val header = Util.buildHeader(MessageNames.GET_RECORDING_STATUS_REPLY, msg.version, None)
    Util.buildJson(header, payload)
  }
  
  def meetingHasEndedToJson(msg: MeetingHasEnded):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER_ID, msg.userId)

    val header = Util.buildHeader(MessageNames.MEETING_ENDED, msg.version, None)
    Util.buildJson(header, payload)
  }   
  
  def startRecordingToJson(msg: StartRecording):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded) 
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    
    val header = Util.buildHeader(MessageNames.START_RECORDING, msg.version, None)
    Util.buildJson(header, payload)
  }

  def stopRecordingToJson(msg: StopRecording):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded) 
    payload.put(Constants.REQUESTER_ID, msg.requesterID)

    val header = Util.buildHeader(MessageNames.STOP_RECORDING, msg.version, None)
    Util.buildJson(header, payload)
  }

  def getAllMeetingsReplyToJson(msg: GetAllMeetingsReply):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put("meetings", msg.meetings)

    val header = Util.buildHeader(MessageNames.GET_ALL_MEETINGS_REPLY, msg.version, None)
    Util.buildJson(header, payload)
  }
}