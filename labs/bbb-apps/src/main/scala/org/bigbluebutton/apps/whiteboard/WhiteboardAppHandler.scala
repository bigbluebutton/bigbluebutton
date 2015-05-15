package org.bigbluebutton.apps.whiteboard

import akka.actor.{ActorRef, actorRef2Scala}
import akka.event.LoggingAdapter
import org.bigbluebutton.apps.RunningMeetingActor
import org.bigbluebutton.apps.whiteboard.messages._

trait WhiteboardAppHandler {
  this : RunningMeetingActor =>
  
  val pubsub: ActorRef
  val log: LoggingAdapter
  
  val wbApp = new WhiteboardApp()
  
  def handleNewWhiteboardShape(msg: NewWhiteboardShape) = {
    val shape = wbApp.addNewShape(msg.descriptor, msg.shape)
    
  }
  
  def handleUpdateWhiteboardShape(msg: UpdateWhiteboardShape) = {
    
  }
  
  def handleDeleteWhiteboardShape(msg: DeleteWhiteboardShape) = {
    
  }
  
  def handleGetWhiteboardShapes(msg: GetWhiteboardShapes) = {
    
  }
  
  def handleClearWhiteboardShapes(msg: ClearWhiteboardShapes) = {
    
  }
  
  def handleDeleteWhiteboard(msg: DeleteWhiteboard) = {
    
  }
  
  def handleGetWhiteboardOptions(msg: GetWhiteboardOptions) = {
    
  }
}