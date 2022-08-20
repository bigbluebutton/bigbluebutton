package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.api.EjectUserFromBreakoutInternalMsg
import org.bigbluebutton.core.apps.breakout.BreakoutHdlrHelpers.{ getRedirectUrls }
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.bus.BigBlueButtonEvent
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.{ EjectReasonCode }
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.{ MsgBuilder }

trait ChangeUserBreakoutReqMsgHdlr extends RightsManagementTrait {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleChangeUserBreakoutReqMsg(msg: ChangeUserBreakoutReqMsg, state: MeetingState2x): MeetingState2x = {

    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to move user among breakout rooms."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
      state
    } else {
      val meetingId = liveMeeting.props.meetingProp.intId

      for {
        breakoutModel <- state.breakout
      } yield {

        //Eject user from room From
        for {
          roomFrom <- breakoutModel.rooms.get(msg.body.fromBreakoutId)
        } yield {
          roomFrom.users.filter(u => u.id == msg.body.userId + "-" + roomFrom.sequence).foreach(user => {
            eventBus.publish(BigBlueButtonEvent(roomFrom.id, EjectUserFromBreakoutInternalMsg(meetingId, roomFrom.id, user.id, msg.header.userId, "User moved to another room", EjectReasonCode.EJECT_USER, false)))
          })
        }

        //Get join URL for room To
        val redirectToHtml5JoinURL = (
            for {
              roomTo <- breakoutModel.rooms.get(msg.body.toBreakoutId)
              (redirectToHtml5JoinURL, redirectJoinURL) <- getRedirectUrls(liveMeeting, msg.body.userId, roomTo.externalId, roomTo.sequence.toString())
            } yield redirectToHtml5JoinURL
          ).getOrElse("")


        BreakoutHdlrHelpers.sendChangeUserBreakoutMsg(
          outGW,
          meetingId,
          msg.body.userId,
          msg.body.fromBreakoutId,
          msg.body.toBreakoutId,
          redirectToHtml5JoinURL,
        )

        //Send notification to moved User
        for {
          roomFrom <- breakoutModel.rooms.get(msg.body.fromBreakoutId)
          roomTo <- breakoutModel.rooms.get(msg.body.toBreakoutId)
        } yield {
          val notifyUserEvent = MsgBuilder.buildNotifyUserInMeetingEvtMsg(
            msg.body.userId,
            liveMeeting.props.meetingProp.intId,
            "info",
            "promote",
            "app.updateBreakoutRoom.userChangeRoomNotification",
            "Notification to warn user was moved to another room",
            Vector(roomTo.shortName)
          )
          outGW.send(notifyUserEvent)
        }
      }

      state
    }
  }

}
