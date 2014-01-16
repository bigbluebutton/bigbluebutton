package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.core.BigBlueButtonGateway
import org.bigbluebutton.core.api._

class VoiceInGateway(bbbGW: BigBlueButtonGateway) {
	def getVoiceUsers(meetingID: String, requesterID: String) {
	  bbbGW.accept(new SendVoiceUsersRequest(meetingID, requesterID))
	}
	
	def muteAllUsers(meetingID: String, requesterID: String, mute: Boolean) {
	  bbbGW.accept(new MuteMeetingRequest(meetingID, requesterID, mute))
	}
	
	def isMeetingMuted(meetingID: String, requesterID: String) {
	  bbbGW.accept(new IsMeetingMutedRequest(meetingID, requesterID))
	}
	
	def muteUser(meetingID: String, requesterID: String, userID: String, mute: Boolean) {
	  bbbGW.accept(new MuteUserRequest(meetingID, requesterID, userID, mute))
	}
	
	def lockUser(meetingID: String, requesterID: String, userID: String, lock: Boolean) {
	  bbbGW.accept(new LockUserRequest(meetingID, requesterID, userID, lock))
	}
	
	def ejectUser(meetingID: String, requesterID: String, userID: String) {
	  bbbGW.accept(new EjectUserRequest(meetingID, requesterID, userID))
	}
	

	def voiceUserLeft(user: String, voiceConfId: String) {
	  bbbGW.acceptVoiceMessage(new VoiceUserLeft(user, voiceConfId))
	}
	
	def voiceUserMuted(user: String, voiceConfId: String, muted: Boolean) {
	  bbbGW.acceptVoiceMessage(new VoiceUserMuted(user, voiceConfId, muted))
	}
	
	def voiceUserTalking(user: String, voiceConfId: String, talking: Boolean) {
	  bbbGW.acceptVoiceMessage(new VoiceUserTalking(user, voiceConfId, talking))
	}
	
}