package org.bigbluebutton.core.meeting

import org.bigbluebutton.conference.service.messaging.redis.MessageSender
import org.bigbluebutton.core.api._
import scala.collection.immutable.HashMap
import com.google.gson.Gson
import scala.collection.JavaConverters._
import org.bigbluebutton.conference.service.messaging.MessagingConstants

class MeetingEventRedisPublisher(service: MessageSender) extends OutMessageListener2 {

	private val KEEP_ALIVE_REPLY = "KEEP_ALIVE_REPLY"

	def handleMessage(msg: IOutMessage) {
	  msg match {
      case msg: MeetingCreated                => handleMeetingCreated(msg)
      case msg: VoiceRecordingStarted         => handleVoiceRecordingStarted(msg)
      case msg: VoiceRecordingStopped         => handleVoiceRecordingStopped(msg)
      case msg: RecordingStatusChanged        => handleRecordingStatusChanged(msg)
      case msg: GetRecordingStatusReply       => handleGetRecordingStatusReply(msg)
      case msg: MeetingEnded                  => handleMeetingEnded(msg)
      case msg: MeetingHasEnded               => handleMeetingHasEnded(msg)
      case msg: MeetingDestroyed              => handleMeetingDestroyed(msg)
	    case msg: KeepAliveMessageReply         => handleKeepAliveMessageReply(msg)
	    case msg: StartRecording                => handleStartRecording(msg)
      case msg: StopRecording                 => handleStopRecording(msg) 
      case msg: GetAllMeetingsReply           => handleGetAllMeetingsReply(msg)
	    case _ => //println("Unhandled message in MeetingEventRedisPublisher")
	  }
  }

  private def handleMeetingDestroyed(msg: MeetingDestroyed) {
    val json = MeetingMessageToJsonConverter.meetingDestroyedToJson(msg)
//    System.out.println("****\n" + json)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)     
  }
	
  private def handleKeepAliveMessageReply(msg: KeepAliveMessageReply) {
    val json = MeetingMessageToJsonConverter.keepAliveMessageReplyToJson(msg)
    service.send(MessagingConstants.FROM_SYSTEM_CHANNEL, json)
  }

  private def handleMeetingCreated(msg:MeetingCreated) {
    val json = MeetingMessageToJsonConverter.meetingCreatedToJson(msg)
//    System.out.println("****\n" + json)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)	
  }

  private def handleMeetingEnded(msg:MeetingEnded){
    val json = MeetingMessageToJsonConverter.meetingEndedToJson(msg)
//    System.out.println("****\n" + json)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)	
  }

  private def handleStartRecording(msg: StartRecording) {
    val json = MeetingMessageToJsonConverter.startRecordingToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleStopRecording(msg: StopRecording) {
    val json = MeetingMessageToJsonConverter.stopRecordingToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }
	  
  private def handleVoiceRecordingStarted(msg: VoiceRecordingStarted) {
    val json = MeetingMessageToJsonConverter.voiceRecordingStartedToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }
  
  private def handleVoiceRecordingStopped(msg: VoiceRecordingStopped) {
    val json = MeetingMessageToJsonConverter.voiceRecordingStoppedToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }
  
  private def handleRecordingStatusChanged(msg: RecordingStatusChanged) {
    val json = MeetingMessageToJsonConverter.recordingStatusChangedToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }	
  
  private def handleGetRecordingStatusReply(msg: GetRecordingStatusReply) {
    val json = MeetingMessageToJsonConverter.getRecordingStatusReplyToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }
  
  private def handleMeetingHasEnded(msg: MeetingHasEnded) {
    val json = MeetingMessageToJsonConverter.meetingHasEndedToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleGetAllMeetingsReply(msg: GetAllMeetingsReply) {
    val json = MeetingMessageToJsonConverter.getAllMeetingsReplyToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }
}