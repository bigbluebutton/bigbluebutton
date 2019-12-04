package org.bigbluebutton.core2.voiceconf

import akka.actor.{ Actor, ActorLogging, FSM }
import org.bigbluebutton.SystemConfiguration

sealed trait VoiceConfState
case object VoiceConfStarted extends VoiceConfState
case object StartRecording extends VoiceConfState
case object RecordingStarted extends VoiceConfState
case object StopRecording extends VoiceConfState
case object RecordingStopped extends VoiceConfState
case object VoiceConfStopped extends VoiceConfState

case class VoiceConfData(record: Boolean, numUsers: Int, streams: Vector[RecordStream])
case class RecordStream(stream: String, started: Boolean)

class VoiceConfActor extends Actor with ActorLogging with FSM[VoiceConfState, VoiceConfData] with SystemConfiguration {

}

