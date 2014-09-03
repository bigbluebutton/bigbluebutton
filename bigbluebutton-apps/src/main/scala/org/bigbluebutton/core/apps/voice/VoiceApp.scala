package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.core.api._
import org.bigbluebutton.core.MeetingActor

trait VoiceApp {
  this : MeetingActor =>
  
  val outGW: MessageOutGateway

  def handleMuteAllExceptPresenterRequest(msg: MuteAllExceptPresenterRequest) {
      
  }
  
  def handleMuteMeetingRequest(msg: MuteMeetingRequest) {
      
  }
    
  def handleIsMeetingMutedRequest(msg: IsMeetingMutedRequest) {
      
  }
    
  def handleMuteUserRequest(msg: MuteUserRequest) {
      
  }
    
  def handleLockUserRequest(msg: LockUserRequest) {
      
  }
    
  def handleEjectUserRequest(msg: EjectUserFromVoiceRequest) {
      
  }
}