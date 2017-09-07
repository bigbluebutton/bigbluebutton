package org.bigbluebutton.core.apps.groupchats

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.{ GroupChatFactory, Users2x }
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }

trait CreateGroupChatReqMsgHdlr {
  this: GroupChatsApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleCreateGroupChatReqMsg(msg: CreateGroupChatReqMsg, state: MeetingState2x): MeetingState2x = {
    val newState = for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, msg.body.requesterId)
      gcId = GroupChatFactory.genId()
      gcUser = GroupChatUser(msg.body.requesterId, user.name)
      gc = GroupChatFactory.create(gcId, msg.body.name, msg.body.open, gcUser)
      groupChats = state.groupChats.add(gc)
      newState = state.update(groupChats)
    } yield {
      val respMsg = buildCreateGroupChatRespMsg(liveMeeting.props.meetingProp.intId, msg.body.requesterId,
        gcId, gc.name, gc.publicChat, msg.body.correlationId)
      outGW.send(respMsg)
      newState
    }

    newState.getOrElse(state)
  }

  def buildCreateGroupChatRespMsg(meetingId: String, userId: String, chatId: String, name: String,
                                  open: Boolean, correlationId: String): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
    val envelope = BbbCoreEnvelope(CreateGroupChatRespMsg.NAME, routing)
    val header = BbbClientMsgHeader(CreateGroupChatRespMsg.NAME, meetingId, userId)

    val body = CreateGroupChatRespMsgBody(correlationId, chatId, name: String, open)
    val event = CreateGroupChatRespMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }
}
