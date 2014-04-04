package org.bigbluebutton.core

import org.bigbluebutton.core.api._
import net.lag.configgy.Configgy
import java.util.concurrent.CountDownLatch
import scala.actors.Actor
import scala.actors.Actor._

class BigBlueButtonGateway(outGW: MessageOutGateway, collGW: CollectorGateway) {
  private val deathSwitch = new CountDownLatch(1)
  // load our config file and configure logfiles.
  Configgy.configure("webapps/bigbluebutton/WEB-INF/configgy-logger.conf")
  // make sure there's always one actor running so scala 2.7.2 doesn't kill off the actors library.
  actor {
	deathSwitch.await
  }
  
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
