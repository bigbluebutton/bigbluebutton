package org.bigbluebutton.core

import org.bigbluebutton.core.api._
import java.util.concurrent.CountDownLatch
import scala.actors.Actor
import scala.actors.Actor._

class BigBlueButtonGateway(outGW: MessageOutGateway, collGW: CollectorGateway) {
  
  private val bbbActor = new BigBlueButtonActor(outGW)
  bbbActor.start
  
  def accept(msg: InMessage):Unit = {
    collGW.collectInMessage(msg)
    
    bbbActor ! msg
    
  }

  def acceptKeepAlive(msg: KeepAliveMessage):Unit = {
  	bbbActor ! msg
  }
  
}
