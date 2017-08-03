package org.bigbluebutton.api2.endpoint.redis

import akka.actor.{Actor, ActorLogging, ActorSystem, Props}
import org.bigbluebutton.api2.SystemConfiguration
import redis.RedisClient


case class RecordMeetingInfoMsg(meetingId: String, info: collection.immutable.Map[String, String])
case class RecordBreakoutInfoMsg(meetingId: String, info: collection.immutable.Map[String, String])
case class AddBreakoutRoomMsg(parentId: String, breakoutId: String)
case class RemoveMeetingMsg(meetingId: String)


object RedisDataStorageActor {
  def props(system: ActorSystem): Props = Props(classOf[RedisDataStorageActor], system)
}

class RedisDataStorageActor(val system: ActorSystem) extends Actor with ActorLogging with SystemConfiguration {

  val redis = RedisClient(redisHost, redisPort)(system)

  // Set the name of this client to be able to distinguish when doing
  // CLIENT LIST on redis-cli
  redis.clientSetname("BbbWebStore")

  def receive = {
    case msg: RecordMeetingInfoMsg => handleRecordMeetingInfoMsg(msg)
    case msg: RecordBreakoutInfoMsg => handleRecordBreakoutInfoMsg(msg)
    case msg: AddBreakoutRoomMsg => handleAddBreakoutRoomMsg(msg)
    case msg: RemoveMeetingMsg => handleRemoveMeetingMsg(msg)
  }


  def handleRecordMeetingInfoMsg(msg: RecordMeetingInfoMsg): Unit = {
    redis.hmset("meeting:info:" + msg.meetingId, msg.info)
  }

  def handleRecordBreakoutInfoMsg(msg: RecordBreakoutInfoMsg): Unit = {
    redis.hmset("meeting:breakout:" + msg.meetingId, msg.info)
  }

  def handleAddBreakoutRoomMsg(msg: AddBreakoutRoomMsg): Unit = {
    redis.sadd("meeting:breakout:rooms:" + msg.parentId, msg.breakoutId)
  }

  def handleRemoveMeetingMsg(msg: RemoveMeetingMsg): Unit = {
    redis.del("meeting-" + msg.meetingId)
    redis.srem("meetings", msg.meetingId)
  }

}
