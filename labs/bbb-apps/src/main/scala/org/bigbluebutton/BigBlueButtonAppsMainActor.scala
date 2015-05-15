package org.bigbluebutton

import akka.actor.Props
import akka.actor.Actor


object BigBlueButtonAppsMainActor {
  def props(name: String): Props = 
	      Props(classOf[BigBlueButtonAppsMainActor])  
}

class BigBlueButtonAppsMainActor extends Actor {

  def receive = {
    case _ => None
  }
}