package org.bigbluebutton.apps.protocol

import org.bigbluebutton.apps.users.data.UserIdAndName


trait InMessage


// Poll Messages
case class PreCreatedPoll(meetingID: String, poll: PollVO) extends InMessage
case class CreatePoll(meetingID: String, requesterID: String, poll: PollVO) extends InMessage
case class UpdatePoll(meetingID: String, requesterID: String, poll: PollVO) extends InMessage
case class GetPolls(meetingID: String, requesterID: String) extends InMessage
case class DestroyPoll(meetingID: String, requesterID: String, pollID: String) extends InMessage
case class RemovePoll(meetingID: String, requesterID: String, pollID: String) extends InMessage
case class SharePoll(meetingID: String, requesterID: String, pollID: String) extends InMessage
case class ShowPollResult(meetingID: String, requesterID: String, pollID: String) extends InMessage
case class HidePollResult(meetingID: String, requesterID: String, pollID: String) extends InMessage
case class StopPoll(meetingID:String, requesterID: String, pollID: String) extends InMessage
case class StartPoll(meetingID:String, requesterID: String, pollID: String) extends InMessage
case class ClearPoll(meetingID: String, requesterID: String, pollID: String, force: Boolean=false) extends InMessage
case class GetPollResult(meetingID:String, requesterID: String, pollID: String) extends InMessage
case class RespondToPoll(meetingID: String, requesterID: String, response: PollResponseVO) extends InMessage

case class ResponseVO(id: String, text: String, responders: Array[Responder] = Array[Responder]())
case class QuestionVO(id: String, multiResponse: Boolean, question: String, responses: Array[ResponseVO])
case class PollVO(id: String, title: String, questions: Array[QuestionVO], started: Boolean = false, stopped: Boolean = false)
case class QuestionResponsesVO(val questionID:String, val responseIDs:Array[String])
case class PollResponseVO(val pollID: String, val responses: Array[QuestionResponsesVO])
case class ResponderVO(responseID: String, user: Responder)
case class Responder(val userID: String, name: String)

case class SendVoiceUsersRequest(meetingID: String, requesterID: String) extends InMessage
case class MuteMeetingRequest(meetingID: String, requesterID: String, mute: Boolean) extends InMessage
case class IsMeetingMutedRequest(meetingID: String, requesterID: String) extends InMessage
case class MuteUserRequest(meetingID: String, requesterID: String, userID: String, mute: Boolean) extends InMessage
case class LockUserRequest(meetingID: String, requesterID: String, userID: String, lock: Boolean) extends InMessage
case class EjectUserRequest(meetingID: String, requesterID: String, userID: String) extends InMessage
case class VoiceUserJoinedMessage(meetingID: String, user: String, voiceConfId: String, callerIdNum: String, callerIdName: String, 
    muted: Boolean, talking: Boolean) extends InMessage
    
case class VoiceUserLeftMessage(meetingID: String, user: String, voiceConfId: String) extends InMessage
case class VoiceUserMutedMessage(meetingID: String, user: String, voiceConfId: String, muted: Boolean) extends InMessage
case class VoiceUserTalkingMessage(meetingID: String, user: String, voiceConfId: String, talking: Boolean) extends InMessage
case class VoiceStartedRecordingMessage(meetingID: String, voiceConfId: String, filename: String, timestamp: String, record: Boolean) extends InMessage

// Need these extra classes since InMessage needs meetingID as parameter and
// our messages from FreeSWITCH doesn't have it.
trait VoiceMessage
case class VoiceUserJoined(user: String, voiceConfId: String, callerIdNum: String, callerIdName: String, muted: Boolean, speaking: Boolean) extends VoiceMessage
    
case class VoiceUserLeft(user: String, voiceConfId: String) extends VoiceMessage
case class VoiceUserMuted(user: String, voiceConfId: String, muted: Boolean) extends VoiceMessage
case class VoiceUserTalking(user: String, voiceConfId: String, talking: Boolean) extends VoiceMessage
case class VoiceStartedRecording(voiceConfId: String, filename: String, timestamp: String, record: Boolean) extends VoiceMessage




