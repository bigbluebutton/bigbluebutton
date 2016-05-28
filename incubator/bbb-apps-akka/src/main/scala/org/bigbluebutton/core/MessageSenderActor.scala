package org.bigbluebutton.core

import akka.actor.Actor
import akka.actor.ActorRef
import akka.actor.ActorLogging
import akka.actor.Props
import org.bigbluebutton.core.api._
import org.bigbluebutton.common.messages.MessagingConstants
import org.bigbluebutton.core.domain.{ SimplePollResultOutVO, SimplePollOutVO, Page }
import org.bigbluebutton.core.pubsub.senders.ChatMessageToJsonConverter
import org.bigbluebutton.common.messages.StartRecordingVoiceConfRequestMessage
import org.bigbluebutton.common.messages.StopRecordingVoiceConfRequestMessage
import org.bigbluebutton.core.pubsub.senders.MeetingMessageToJsonConverter
import org.bigbluebutton.core.pubsub.senders.PesentationMessageToJsonConverter
import org.bigbluebutton.core.pubsub.senders.CaptionMessageToJsonConverter
import org.bigbluebutton.core.pubsub.senders.DeskShareMessageToJsonConverter
import org.bigbluebutton.common.messages.GetPresentationInfoReplyMessage
import org.bigbluebutton.common.messages.PresentationRemovedMessage
import scala.collection.JavaConversions._
import org.bigbluebutton.core.pubsub.senders.UsersMessageToJsonConverter
import org.bigbluebutton.common.messages.GetUsersFromVoiceConfRequestMessage
import org.bigbluebutton.common.messages.MuteUserInVoiceConfRequestMessage
import org.bigbluebutton.common.messages.EjectUserFromVoiceConfRequestMessage
import org.bigbluebutton.common.messages.GetCurrentLayoutReplyMessage
import org.bigbluebutton.common.messages.BroadcastLayoutMessage
import org.bigbluebutton.common.messages.UserEjectedFromMeetingMessage
import org.bigbluebutton.common.messages.LockLayoutMessage
import org.bigbluebutton.core.pubsub.senders.WhiteboardMessageToJsonConverter
import org.bigbluebutton.common.converters.ToJsonEncoder
import org.bigbluebutton.common.messages.TransferUserToVoiceConfRequestMessage

object MessageSenderActor {
  def props(msgSender: MessageSender): Props =
    Props(classOf[MessageSenderActor], msgSender)
}

class MessageSenderActor(val service: MessageSender)
    extends Actor with ActorLogging {

  val encoder = new ToJsonEncoder()

  def receive = {

    case _ => // do nothing
  }

}
