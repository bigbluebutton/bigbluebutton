package org.bigbluebutton.core.apps.users

import org.bigbluebutton.ClientSettings.getConfigPropertyValueByPathAsIntOrElse
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.db.{ MeetingUsersPoliciesDAO, NotificationDAO }
import org.bigbluebutton.core.models.{ Roles, UserState, Users2x }
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait SetUserWhiteboardWriteAccessReqMsgHdlr extends RightsManagementTrait {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleSetUserWhiteboardWriteAccessReqMsg(msg: SetUserWhiteboardWriteAccessReqMsg): Unit = {
    log.info("handleSetUserWhiteboardWriteAccessReqMsg: userIds={} allUsers={}, whiteboardWriteAccess={}", msg.body.userIds, msg.body.allUsers, msg.body.whiteboardWriteAccess)

    def broadcast(user: UserState): Unit = {
      val routingChange = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelopeChange = BbbCoreEnvelope(SetUserWhiteboardWriteAccessEvtMsg.NAME, routingChange)
      val headerChange = BbbClientMsgHeader(SetUserWhiteboardWriteAccessEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val bodyChange = SetUserWhiteboardWriteAccessEvtMsgBody(user.intId, user.whiteboardWriteAccess)
      val eventChange = SetUserWhiteboardWriteAccessEvtMsg(headerChange, bodyChange)
      val msgEventChange = BbbCommonEnvCoreMsg(envelopeChange, eventChange)
      outGW.send(msgEventChange)
    }

    val isUserModerator = !permissionFailed(
      PermissionCheck.MOD_LEVEL,
      PermissionCheck.VIEWER_LEVEL,
      liveMeeting.users2x,
      msg.header.userId
    )

    val isUserPresenter = !permissionFailed(
      PermissionCheck.VIEWER_LEVEL,
      PermissionCheck.PRESENTER_LEVEL,
      liveMeeting.users2x,
      msg.header.userId
    )

    if (isUserModerator || isUserPresenter) {
      val maxNumberOfActiveUsers = getConfigPropertyValueByPathAsIntOrElse(liveMeeting.clientSettings, "public.whiteboard.maxNumberOfActiveUsers", 25)

      val usersToSetWhiteboardWrite = {
        if (msg.body.allUsers) {
          for {
            userState <- Users2x.findAll(liveMeeting.users2x).sortBy(_.role == Roles.MODERATOR_ROLE)(Ordering.Boolean.reverse)
            if !userState.loggedOut
            if !userState.bot
            if userState.whiteboardWriteAccess != msg.body.whiteboardWriteAccess
          } yield userState.intId
        } else {
          for {
            userId <- msg.body.userIds
            userState <- Users2x.findWithIntId(liveMeeting.users2x, userId)
            if userState.whiteboardWriteAccess != msg.body.whiteboardWriteAccess
          } yield userId
        }
      }

      val availableSlots = {
        if (msg.body.whiteboardWriteAccess) {
          val currentActiveUsersCount = Users2x
            .findAll(liveMeeting.users2x)
            .count(_.whiteboardWriteAccess)

          math.max(0, maxNumberOfActiveUsers - currentActiveUsersCount)
        } else {
          usersToSetWhiteboardWrite.length
        }
      }

      if (msg.body.whiteboardWriteAccess &&
        availableSlots < usersToSetWhiteboardWrite.length) {
        log.info("Setting whiteboard write access in meeting {} exceeds the maximum number of {} writers. It will allow only {} users.", msg.header.meetingId, maxNumberOfActiveUsers, availableSlots)

        val notifyEvent = MsgBuilder.buildNotifyUserInMeetingEvtMsg(
          msg.header.userId,
          liveMeeting.props.meetingProp.intId,
          "info",
          "pen_tool",
          "app.whiteboard.toolbar.multiUserLimitHasBeenReachedNotification",
          "Notification when the maximum number of whiteboard writers has been reached",
          Map("numberOfUsers" -> maxNumberOfActiveUsers.toString)
        )
        outGW.send(notifyEvent)
      }

      for {
        userId <- usersToSetWhiteboardWrite.take(availableSlots)
        newUserState <- Users2x.setUserWhiteboardWriteAccess(liveMeeting.users2x, userId, msg.body.whiteboardWriteAccess)
      } yield {
        broadcast(newUserState)

        if (newUserState.whiteboardWriteAccess) {
          val notifyEvent = MsgBuilder.buildNotifyUserInMeetingEvtMsg(
            newUserState.intId,
            liveMeeting.props.meetingProp.intId,
            "info",
            "pen_tool",
            "app.whiteboard.available",
            "Notification to when the user received whiteboard access",
            Map()
          )
          outGW.send(notifyEvent)
          NotificationDAO.insert(notifyEvent)
        } else {
          val notifyEvent = MsgBuilder.buildNotifyUserInMeetingEvtMsg(
            newUserState.intId,
            liveMeeting.props.meetingProp.intId,
            "info",
            "pen_tool",
            "app.whiteboard.unavailable",
            "Notification to when the user lost whiteboard access",
            Map()
          )
          outGW.send(notifyEvent)
          NotificationDAO.insert(notifyEvent)
        }
      }

      // Set Meeting with new multiUserWhiteboardEnabled
      if (msg.body.allUsers) {
        MeetingStatus2x.multiUserWhiteboardEnabled(liveMeeting.status) match {
          case currWhiteboardWriteAccess if currWhiteboardWriteAccess != msg.body.whiteboardWriteAccess =>
            MeetingStatus2x.setMultiUserWhiteboardEnabled(liveMeeting.status, msg.body.whiteboardWriteAccess)
          case _ => //Nothing
        }
        MeetingUsersPoliciesDAO.updateMultiUserWhiteboardEnabled(msg.header.meetingId, msg.body.whiteboardWriteAccess)
      }
    } else {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to change user whiteboardWriteAccess prop."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    }

  }
}