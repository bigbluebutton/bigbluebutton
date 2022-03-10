package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.api.{ SendMessageToBreakoutRoomInternalMsg }
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.bus.BigBlueButtonEvent
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.{ RegisteredUsers }
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }

trait SendMessageToAllBreakoutRoomsMsgHdlr extends RightsManagementTrait {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleSendMessageToAllBreakoutRoomsMsg(msg: SendMessageToAllBreakoutRoomsReqMsg, state: MeetingState2x): MeetingState2x = {
    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to send message to all breakout rooms for meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
      state
    } else {
      for {
        breakoutModel <- state.breakout
        senderUser <- RegisteredUsers.findWithUserId(msg.header.userId, liveMeeting.registeredUsers)
      } yield {
        breakoutModel.rooms.values.foreach { room =>
          eventBus.publish(BigBlueButtonEvent(room.id, SendMessageToBreakoutRoomInternalMsg(props.breakoutProps.parentId, room.id, senderUser.name, msg.body.msg)))
        }

        val event = buildSendMessageToAllBreakoutRoomsEvtMsg(msg.header.userId, msg.body.msg, breakoutModel.rooms.size)
        outGW.send(event)

        log.debug("Sending message '{}' to all breakout rooms in meeting {}", msg.body.msg, props.meetingProp.intId)
      }

      state
    }
  }

  def buildSendMessageToAllBreakoutRoomsEvtMsg(senderId: String, msg: String, totalOfRooms: Int): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(SendMessageToAllBreakoutRoomsEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(SendMessageToAllBreakoutRoomsEvtMsg.NAME, liveMeeting.props.meetingProp.intId, "not-used")

    val body = SendMessageToAllBreakoutRoomsEvtMsgBody(props.meetingProp.intId, senderId, msg, totalOfRooms)
    val event = SendMessageToAllBreakoutRoomsEvtMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, event)
  }

}
