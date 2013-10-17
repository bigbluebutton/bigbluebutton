package org.bigbluebutton.core.apps.voice.messages

import org.bigbluebutton.core.api.InMessage
import org.bigbluebutton.core.api.IOutMessage

case class SendVoiceUsersRequest(
    meetingID: String, 
    requesterID: String) extends InMessage
    
case class MuteMeetingRequest(
    meetingID: String, 
    requesterID: String, 
    mute: Boolean) extends InMessage
    
case class IsMeetingMutedRequest(
    meetingID: String, 
    requesterID: String) extends InMessage
    
case class MuteUserRequest(
    meetingID: String, 
    requesterID: String, 
    userID: String, 
    mute: Boolean) extends InMessage
    
case class LockUserRequest(
    meetingID: String, 
    requesterID: String, 
    userID: String, 
    lock: Boolean) extends InMessage
    
case class EjectUserRequest(
    meetingID: String, 
    requesterID: String, 
    userID: String) extends InMessage
    
case class VoiceUserJoinedMessage(
    meetingID: String,
    user: String, 
    voiceConfId: String, 
    callerIdNum: String, 
    callerIdName: String, 
    muted: Boolean, 
    talking: Boolean) extends InMessage
    
case class VoiceUserLeftMessage(meetingID: String, user: String, voiceConfId: String) extends InMessage
case class VoiceUserMutedMessage(meetingID: String, user: String, voiceConfId: String, muted: Boolean) extends InMessage
case class VoiceUserTalkingMessage(meetingID: String, user: String, voiceConfId: String, talking: Boolean) extends InMessage
case class VoiceStartedRecordingMessage(meetingID: String, voiceConfId: String, filename: String, timestamp: String, record: Boolean) extends InMessage

// Need these extra classes since InMessage needs meetingID as parameter and
// our messages from FreeSWITCH doesn't have it.
trait VoiceMessage
case class VoiceUserJoined(
    user: String, 
    voiceConfId: String, 
    callerIdNum: String, 
    callerIdName: String, 
    muted: Boolean, 
    speaking: Boolean) extends VoiceMessage
    
case class VoiceUserLeft(user: String, voiceConfId: String) extends VoiceMessage
case class VoiceUserMuted(user: String, voiceConfId: String, muted: Boolean) extends VoiceMessage
case class VoiceUserTalking(user: String, voiceConfId: String, talking: Boolean) extends VoiceMessage
case class VoiceStartedRecording(voiceConfId: String, filename: String, timestamp: String, record: Boolean) extends VoiceMessage



case class IsMeetingMutedReply(meetingID: String, recorded: Boolean, requesterID: String, meetingMuted: Boolean) extends IOutMessage
