package org.bigbluebutton.api2.meeting

import akka.actor.{Actor, ActorLogging, Props}
import org.bigbluebutton.api2.bus.MsgToAkkaAppsEventBus


sealed trait ApiMsg
case class CreateBreakoutRoomMsg(meetingId: String, parentMeetingId: String,
                                 name: String, sequence: Integer, voiceConfId: String,
                                 viewerPassword: String, moderatorPassword: String, duration: Int,
                                 sourcePresentationId: String, sourcePresentationSlide: Int,
                                 record: Boolean) extends ApiMsg
case class CreateMeetingMsg() extends ApiMsg
case class EndBreakoutRoomMsg() extends ApiMsg
case class KeepAliveReply() extends ApiMsg
case class MeetingDestoyedMsg() extends ApiMsg
case class MeetingStartedMsg() extends ApiMsg

object MeetingsManagerActor {
  def props(msgToAkkaAppsEventBus: MsgToAkkaAppsEventBus): Props =
    Props(classOf[MeetingsManagerActor], msgToAkkaAppsEventBus)
}

class MeetingsManagerActor(msgToAkkaAppsEventBus: MsgToAkkaAppsEventBus) extends Actor with ActorLogging {

  def receive = {

  }
}
