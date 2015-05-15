package org.bigbluebutton.apps.layout

import akka.actor.{ActorRef, actorRef2Scala}
import akka.event.LoggingAdapter
import org.bigbluebutton.apps.RunningMeetingActor
import org.bigbluebutton.apps.layout.messages._

trait LayoutAppHandler {
  this : RunningMeetingActor =>
  
  val pubsub: ActorRef
  val log: LoggingAdapter
  
  val layoutApp = new LayoutApp()
  
  def handleNewLayout(msg: NewLayout) = {
    val lout = layoutApp.newLayout(msg.layoutId, msg.layout, msg.default)
  }
  
  def handleSetLayoutRequest(msg: SetLayoutRequest) = {
    val layout = layoutApp.setLayout(msg.layoutId)
    
    layout foreach { l =>
      pubsub ! SetLayout(session, msg.requester, l.id)
    }  
  }
  
  def handleGetCurrentLayoutRequest(msg: GetCurrentLayoutRequest) = {
    layoutApp.currentLayout foreach { l => 
      pubsub ! GetCurrentLayoutResponse(session, msg.requester, l.id)  
    }
  }
  
  def handleLockLayoutRequest(msg: LockLayoutRequest) = {
    layoutApp.lockLayout(msg.layoutId, msg.lock) foreach { l =>
      pubsub ! LockedLayout(session, msg.requester, msg.lock, l.id)  
    }
  }
}