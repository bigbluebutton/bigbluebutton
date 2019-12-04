
package org.bigbluebutton.transcode.core

import scala.collection.mutable.HashMap
import akka.actor.ActorRef

class TranscodersModel {

  private var meetings = new HashMap[String, HashMap[String, ActorRef]]

  def addTranscoder(meetingId: String, transcoderId: String, transcoderActor: ActorRef) {
    meetings.get(meetingId) match {
      case Some(transcoders) => transcoders += transcoderId -> transcoderActor
      case _ =>
        var transcoders = new HashMap[String, ActorRef]
        transcoders += transcoderId -> transcoderActor
        meetings += meetingId -> transcoders
    }
  }

  def removeTranscoder(meetingId: String, transcoderId: String) {
    meetings.get(meetingId) match {
      case Some(transcoders) => transcoders -= transcoderId
      case _                 =>
    }
  }

  def getTranscoder(meetingId: String, transcoderId: String): Option[ActorRef] = {
    meetings.get(meetingId) match {
      case Some(transcoders) => transcoders.get(transcoderId)
      case _                 => None
    }
  }

  def getTranscoders(meetingId: String): Array[ActorRef] = {
    meetings.get(meetingId) match {
      case Some(transcoders) => transcoders.values toArray
      case _                 => Array.empty
    }
  }
}
