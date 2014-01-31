package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.core.api._
import net.lag.logging.Logger
import org.bigbluebutton.core.MeetingActor

trait VoiceApp {
  this : MeetingActor =>
  
  val log: Logger
  val outGW: MessageOutGateway
     
  def handleSendVoiceUsersRequest(msg: SendVoiceUsersRequest) {
      
  }
    
  def handleMuteMeetingRequest(msg: MuteMeetingRequest) {
      
  }
    
  def handleIsMeetingMutedRequest(msg: IsMeetingMutedRequest) {
      
  }
    
  def handleMuteUserRequest(msg: MuteUserRequest) {
      
  }
    
  def handleLockUserRequest(msg: LockUserRequest) {
      
  }
    
  def handleEjectUserRequest(msg: EjectUserRequest) {
      
  }
}