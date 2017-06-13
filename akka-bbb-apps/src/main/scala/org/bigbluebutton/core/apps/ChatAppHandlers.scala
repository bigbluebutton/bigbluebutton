package org.bigbluebutton.core.apps

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.SendDirectChatMsgCmd
import org.bigbluebutton.core.models.DirectChats
import org.bigbluebutton.core.running.LiveMeeting

trait ChatAppHandlers {
  val liveMeeting: LiveMeeting
  val outGW: OutMessageGateway

  def handleSendDirectChatMsgCmd(msg: SendDirectChatMsgCmd): Unit = {
    def send(): Unit = {

    }

    val between = Set("foo", "bar")
    for {
      chat <- DirectChats.find(between, liveMeeting.chatModel.directChats)

    } yield {
      send()
    }
  }

  def handleCreatePublicChatCmd(): Unit = {

  }
}
