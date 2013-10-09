package org.bigbluebutton.core

import org.bigbluebutton.core.api.InMessage
import org.bigbluebutton.core.api.MessageOutGateway
import org.bigbluebutton.core.api.KeepAliveMessage
import org.bigbluebutton.core.apps.voice.messages.VoiceMessage

class BigBlueButtonGateway(outGW: MessageOutGateway) {
  
  private val bbbActor = new BigBlueButtonActor(outGW)
  bbbActor.start
  
  def accept(msg: InMessage):Unit = {
    bbbActor ! msg
  }

  def acceptKeepAlive(msg: KeepAliveMessage):Unit = {
  	bbbActor ! msg
  }
  
  def acceptVoiceMessage(msg: VoiceMessage) {
    bbbActor ! msg
  }
}