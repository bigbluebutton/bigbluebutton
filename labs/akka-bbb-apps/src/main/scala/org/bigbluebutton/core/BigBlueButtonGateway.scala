package org.bigbluebutton.core

import org.bigbluebutton.core.api._
import java.util.concurrent.CountDownLatch
import akka.actor.{ ActorSystem, Props }

class BigBlueButtonGateway(system: ActorSystem, outGW: MessageOutGateway) {

  val bbbActor = system.actorOf(BigBlueButtonActor.props(system, outGW), "bigbluebutton-actor")

  def accept(msg: InMessage): Unit = {
    bbbActor ! msg
  }

  def acceptKeepAlive(msg: KeepAliveMessage): Unit = {
    bbbActor ! msg
  }

  def acceptUserJoinedVoiceConfMessage(msg: UserJoinedVoiceConfMessage) {
    bbbActor ! msg
  }

  def acceptUserLeftVoiceConfMessage(msg: UserLeftVoiceConfMessage) {
    bbbActor ! msg
  }

  def acceptUserLockedInVoiceConfMessage(msg: UserLockedInVoiceConfMessage) {
    bbbActor ! msg
  }

  def acceptUserMutedInVoiceConfMessage(msg: UserMutedInVoiceConfMessage) {
    bbbActor ! msg
  }

  def acceptUserTalkingInVoiceConfMessage(msg: UserTalkingInVoiceConfMessage) {
    bbbActor ! msg
  }

  def acceptVoiceConfRecordingStartedMessage(msg: VoiceConfRecordingStartedMessage) {
    bbbActor ! msg
  }
}
