package org.bigbluebutton.core.pubsub.senders

import org.bigbluebutton.core.api.OutMessageListener2
import org.bigbluebutton.core.MessageSender
import org.bigbluebutton.core.api._
import com.google.gson.Gson
import scala.collection.mutable.HashMap
import collection.JavaConverters._
import scala.collection.JavaConversions._
import java.util.ArrayList
import org.bigbluebutton.common.messages.MessagingConstants
import org.bigbluebutton.core.messaging.Util
import org.bigbluebutton.core.apps.SimplePollOutVO
import org.bigbluebutton.core.apps.SimplePollResultOutVO

class PollingEventRedisPublisher(service: MessageSender) extends OutMessageListener2 {
  def handleMessage(msg: IOutMessage) {
    msg match {
      case msg: PollStartedMessage => handlePollStartedMessage(msg)
      case msg: PollStoppedMessage => handlePollStoppedMessage(msg)
      case msg: PollShowResultMessage => handlePollShowResultMessage(msg)
      case msg: PollHideResultMessage => handlePollHideResultMessage(msg)
      case msg: UserRespondedToPollMessage => handleUserRespondedToPollMessage(msg)
      case _ => // do nothing
    }
  }

  private def handlePollStartedMessage(msg: PollStartedMessage) {
    val json = pollStartedMessageToJson(msg)
    service.send(MessagingConstants.FROM_POLLING_CHANNEL, json)
  }

  private def handlePollStoppedMessage(msg: PollStoppedMessage) {
    val json = pollStoppedMessageToJson(msg)
    service.send(MessagingConstants.FROM_POLLING_CHANNEL, json)
  }

  private def handlePollShowResultMessage(msg: PollShowResultMessage) {
    val json = pollShowResultMessageToJson(msg)
    service.send(MessagingConstants.FROM_POLLING_CHANNEL, json)
  }

  private def handlePollHideResultMessage(msg: PollHideResultMessage) {
    val json = pollHideResultMessageToJson(msg)
    service.send(MessagingConstants.FROM_POLLING_CHANNEL, json)
  }

  private def handleUserRespondedToPollMessage(msg: UserRespondedToPollMessage) {
    //    val json = ChatMessageToJsonConverter.sendPrivateMessageEventToJson(msg)
    //    service.send(MessagingConstants.FROM_CHAT_CHANNEL, json)
  }

  private def pollVOtoMap(msg: SimplePollOutVO): java.util.HashMap[String, Object] = {
    val pollVO = new java.util.HashMap[String, Object]()
    pollVO.put("id", msg.id)

    val answers = new java.util.ArrayList[java.util.Map[String, Any]];
    msg.answers.foreach(ans => {
      val amap = new java.util.HashMap[String, Any]()
      amap.put("id", ans.id)
      amap.put("key", ans.key)
      answers.add(amap)
    })

    pollVO.put("answers", answers)

    pollVO
  }

  private def pollStartedMessageToJson(msg: PollStartedMessage): String = {
    //    val payload = new java.util.HashMap[String, Any]()
    //    payload.put(Constants.MEETING_ID, msg.meetingID)
    //    payload.put(org.bigbluebutton.common.messages.PollStartedMessage.REQUESTER_ID, msg.requesterId)

    //    val pollVO = pollVOtoMap(msg.poll)
    //    payload.put(org.bigbluebutton.common.messages.PollStartedMessage.POLL, pollVO)

    //    val header = Util.buildHeader(org.bigbluebutton.common.messages.PollStartedMessage.POLL_STARTED, None)
    //    Util.buildJson(header, payload)

    val pollVO = pollVOtoMap(msg.poll)
    val psm = new org.bigbluebutton.common.messages.PollStartedMessage(msg.meetingID, msg.requesterId, pollVO)
    psm.toJson
  }

  private def pollStoppedMessageToJson(msg: PollStoppedMessage): String = {
    val psm = new org.bigbluebutton.common.messages.PollStoppedMessage(msg.meetingID, msg.requesterId, msg.pollId)
    psm.toJson
  }

  private def pollResultVOtoMap(msg: SimplePollResultOutVO): java.util.HashMap[String, Object] = {
    val pollVO = new java.util.HashMap[String, Object]()
    pollVO.put("id", msg.id)

    val answers = new java.util.ArrayList[java.util.Map[String, Any]];
    msg.answers.foreach(ans => {
      val amap = new java.util.HashMap[String, Any]()
      amap.put("id", ans.id)
      amap.put("key", ans.key)
      amap.put("num_votes", ans.numVotes)
      answers.add(amap)
    })

    pollVO.put("answers", answers)

    pollVO
  }

  private def pollShowResultMessageToJson(msg: PollShowResultMessage): String = {
    val pollResultVO = pollResultVOtoMap(msg.poll)

    val psm = new org.bigbluebutton.common.messages.PollShowResultMessage(msg.meetingID, pollResultVO)
    psm.toJson
  }

  private def pollHideResultMessageToJson(msg: PollHideResultMessage): String = {
    val psm = new org.bigbluebutton.common.messages.PollHideResultMessage(msg.meetingID, msg.pollId)
    psm.toJson
  }

  private def UserRespondedToPollMessageTpJson(msg: UserRespondedToPollMessage): String = {
    val pollResultVO = pollResultVOtoMap(msg.poll)
    val psm = new org.bigbluebutton.common.messages.UserVotedPollMessage(msg.meetingID, msg.presenterId, pollResultVO)
    psm.toJson
  }
}