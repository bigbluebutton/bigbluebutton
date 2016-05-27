
package org.bigbluebutton.transcode.core

import scala.collection.mutable.HashMap
import akka.actor.ActorRef

class TranscodersModel {

  private var transcoders = new HashMap[String, ActorRef]

  def addTranscoder(transcoderId: String, transcoderActor: ActorRef) {
    transcoders += transcoderId -> transcoderActor
  }

  def removeTranscoder(transcoderId: String) {
    transcoders -= transcoderId
  }

  def getTranscoder(transcoderId: String): Option[ActorRef] = {
    transcoders.get(transcoderId)
  }

  def getTranscoders(): Array[ActorRef] = {
    transcoders.values toArray
  }
}
