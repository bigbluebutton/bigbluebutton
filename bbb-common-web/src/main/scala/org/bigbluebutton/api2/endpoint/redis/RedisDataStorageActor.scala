package org.bigbluebutton.api2.endpoint.redis

import org.bigbluebutton.api2.SystemConfiguration
import org.bigbluebutton.common2.redis.RedisStorageProvider

import akka.actor.Actor
import akka.actor.ActorLogging
import akka.actor.ActorSystem
import akka.actor.Props

case class RecordMeetingInfoMsg(meetingId: String, info: collection.immutable.Map[String, String])
case class RecordBreakoutInfoMsg(meetingId: String, info: collection.immutable.Map[String, String])
case class AddBreakoutRoomMsg(parentId: String, breakoutId: String)
case class RemoveMeetingMsg(meetingId: String)

object RedisDataStorageActor {
  def props(system: ActorSystem): Props = Props(classOf[RedisDataStorageActor], system)
}

class RedisDataStorageActor(val system: ActorSystem)
  extends RedisStorageProvider(system, "BbbWebStore")
  with SystemConfiguration
  with Actor with ActorLogging {

  def receive = {
    case msg: RecordMeetingInfoMsg  => handleRecordMeetingInfoMsg(msg)
    case msg: RecordBreakoutInfoMsg => handleRecordBreakoutInfoMsg(msg)
    case msg: AddBreakoutRoomMsg    => handleAddBreakoutRoomMsg(msg)
    case msg: RemoveMeetingMsg      => handleRemoveMeetingMsg(msg)
  }

  def handleRecordMeetingInfoMsg(msg: RecordMeetingInfoMsg): Unit = {
    redis.recordMeetingInfo(msg.meetingId, msg.info.asInstanceOf[java.util.Map[java.lang.String, java.lang.String]]);
  }

  def handleRecordBreakoutInfoMsg(msg: RecordBreakoutInfoMsg): Unit = {
    redis.recordBreakoutInfo(msg.meetingId, msg.info.asInstanceOf[java.util.Map[java.lang.String, java.lang.String]])
  }

  def handleAddBreakoutRoomMsg(msg: AddBreakoutRoomMsg): Unit = {
    redis.addBreakoutRoom(msg.parentId, msg.breakoutId)
  }

  def handleRemoveMeetingMsg(msg: RemoveMeetingMsg): Unit = {
    redis.removeMeeting(msg.meetingId)
  }

}
