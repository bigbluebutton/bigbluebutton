package org.bigbluebutton.core

import org.bigbluebutton.core.api.IDispatcher
import org.bigbluebutton.core.api.InMessage
import org.bigbluebutton.core.api.IOutMessage
import org.bigbluebutton.core.api.OutMessageListener2

class CollectorGateway(dispatcher: IDispatcher) extends OutMessageListener2 {

  // FIXME
//  private val collActor = new CollectorActor(dispatcher)
  
//  collActor.start
  
  def collectInMessage(msg: InMessage) {
//    collActor ! msg
  }
  
  def handleMessage(msg: IOutMessage) {
//    collActor ! msg
  }
}