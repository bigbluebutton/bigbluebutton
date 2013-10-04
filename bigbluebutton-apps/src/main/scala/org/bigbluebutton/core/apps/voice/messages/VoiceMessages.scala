package org.bigbluebutton.core.apps.voice.messages

import org.bigbluebutton.core.api.InMessage
import org.bigbluebutton.core.api.IOutMessage

case class SendVoiceUsersRequest(meetingID: String, requesterID: String) extends InMessage
case class MuteMeetingRequest(meetingID: String, requesterID: String, mute: Boolean) extends InMessage
case class IsMeetingMutedRequest(meetingID: String, requesterID: String) extends InMessage
case class MuteUserRequest(meetingID: String, requesterID: String, userID: Int, mute: Boolean) extends InMessage
case class LockUserRequest(meetingID: String, requesterID: String, userID: Int, lock: Boolean) extends InMessage
case class EjectUserRequest(meetingID: String, requesterID: String, userID: Int) extends InMessage

