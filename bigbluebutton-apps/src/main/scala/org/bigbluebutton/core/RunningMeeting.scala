package org.bigbluebutton.core

import akka.actor.ActorRef
import akka.actor.ActorContext
import org.bigbluebutton.core.api.MessageOutGateway

object RunningMeeting {  
  def apply(meetingID: String, externalMeetingID: String, meetingName: String, recorded: Boolean, 
                   voiceBridge: String, duration: Long, 
                   autoStartRecording: Boolean, allowStartStopRecording: Boolean,
                   moderatorPass: String, viewerPass: String,
                   createTime: Long, createDate: String,
                   outGW: MessageOutGateway)
              (implicit context: ActorContext) = 
                new RunningMeeting(meetingID, externalMeetingID, meetingName, recorded, 
                   voiceBridge, duration, 
                   autoStartRecording, allowStartStopRecording,
                   moderatorPass, viewerPass,
                   createTime, createDate,
                   outGW)(context)
}

class RunningMeeting (val meetingID: String, val externalMeetingID: String, val meetingName: String, val recorded: Boolean, 
                   val voiceBridge: String, val duration: Long, 
                   val autoStartRecording: Boolean, val allowStartStopRecording: Boolean,
                   val moderatorPass: String, val viewerPass: String,
                   val createTime: Long, val createDate: String,
                   val outGW: MessageOutGateway)
              (implicit val context: ActorContext) {
  
  val actorRef = context.actorOf(MeetingActor.props(meetingID, externalMeetingID, meetingName, recorded, 
                   voiceBridge, duration, 
                   autoStartRecording, allowStartStopRecording,
                   moderatorPass, viewerPass,
                   createTime, createDate,
                   outGW), meetingID)  
}