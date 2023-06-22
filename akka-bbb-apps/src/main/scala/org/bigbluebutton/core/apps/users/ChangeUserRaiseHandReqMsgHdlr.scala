package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.models.{ UserState, Users2x }
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait ChangeUserRaiseHandReqMsgHdlr extends RightsManagementTrait {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleChangeUserRaiseHandReqMsg(msg: ChangeUserRaiseHandReqMsg): Unit = {
    log.info("handleChangeUserRaiseHandReqMsg: raiseHand={} userId={}", msg.body.raiseHand, msg.body.userId)

    def broadcast(user: UserState, raiseHand: Boolean): Unit = {
      val routingChange = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId, user.intId
      )
      val envelopeChange = BbbCoreEnvelope(UserRaiseHandChangedEvtMsg.NAME, routingChange)
      val headerChange = BbbClientMsgHeader(UserRaiseHandChangedEvtMsg.NAME, liveMeeting.props.meetingProp.intId,
        user.intId)

      val bodyChange = UserRaiseHandChangedEvtMsgBody(user.intId, raiseHand)
      val eventChange = UserRaiseHandChangedEvtMsg(headerChange, bodyChange)
      val msgEventChange = BbbCommonEnvCoreMsg(envelopeChange, eventChange)
      outGW.send(msgEventChange)
    }

    val isUserSettingOwnProps = (msg.header.userId == msg.body.userId)

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

    if (isUserSettingOwnProps || isUserModerator || isUserPresenter) {
      for {
        user <- Users2x.findWithIntId(liveMeeting.users2x, msg.body.userId)
        newUserState <- Users2x.setUserRaiseHand(liveMeeting.users2x, user.intId, msg.body.raiseHand)
      } yield {

        if (msg.body.raiseHand && user.emoji == "") {
          Users2x.setEmojiStatus(liveMeeting.users2x, msg.body.userId, "raiseHand")
          outGW.send(MsgBuilder.buildUserEmojiChangedEvtMsg(liveMeeting.props.meetingProp.intId, msg.body.userId, "raiseHand"))
        }

        if (msg.body.raiseHand == false && user.emoji == "raiseHand") {
          Users2x.setEmojiStatus(liveMeeting.users2x, msg.body.userId, "none")
          outGW.send(MsgBuilder.buildUserEmojiChangedEvtMsg(liveMeeting.props.meetingProp.intId, msg.body.userId, "none"))
        }

        broadcast(newUserState, msg.body.raiseHand)
      }
    } else {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to change user raiseHand prop."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    }

  }
}