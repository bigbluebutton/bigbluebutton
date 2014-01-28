package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.core.api.InMessage
import org.bigbluebutton.core.api.MessageOutGateway
import org.bigbluebutton.core.apps.voice.messages._

class VoiceApp(meetingID: String, recorded: Boolean, outGW: MessageOutGateway) {
    def handleMessage(msg: InMessage):Unit = {
	    msg match {
	      case sendVoiceUsersRequest:SendVoiceUsersRequest => handleSendVoiceUsersRequest(sendVoiceUsersRequest)
	      case muteMeetingRequest:MuteMeetingRequest => handleMuteMeetingRequest(muteMeetingRequest)
	      case isMeetingMutedRequest:IsMeetingMutedRequest => handleIsMeetingMutedRequest(isMeetingMutedRequest)
	      case muteUserRequest:MuteUserRequest => handleMuteUserRequest(muteUserRequest)
	      case lockUserRequest:LockUserRequest => handleLockUserRequest(lockUserRequest)
	      case ejectUserRequest:EjectUserRequest => handleEjectUserRequest(ejectUserRequest)
	      case _ => // do nothing
	    }
    }
    
    private def handleSendVoiceUsersRequest(msg: SendVoiceUsersRequest) {
      
    }
    
    private def handleMuteMeetingRequest(msg: MuteMeetingRequest) {
      
    }
    
    private def handleIsMeetingMutedRequest(msg: IsMeetingMutedRequest) {
      
    }
    
    private def handleMuteUserRequest(msg: MuteUserRequest) {
      
    }
    
    private def handleLockUserRequest(msg: LockUserRequest) {
      
    }
    
    private def handleEjectUserRequest(msg: EjectUserRequest) {
      
    }
}