package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.RightsManagementTrait
import org.bigbluebutton.core.models.{ UserState, Users2x }
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }

trait ChangeUserMobileFlagReqMsgHdlr extends RightsManagementTrait {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleChangeUserMobileFlagReqMsg(msg: ChangeUserMobileFlagReqMsg): Unit = {
    log.info("handleChangeUserMobileFlagReqMsg: mobile={} userId={}", msg.body.mobile, msg.body.userId)

    def broadcastUserMobileChanged(user: UserState, mobile: Boolean): Unit = {
      val routingChange = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId, user.intId
      )
      val envelopeChange = BbbCoreEnvelope(UserMobileFlagChangedEvtMsg.NAME, routingChange)
      val headerChange = BbbClientMsgHeader(UserMobileFlagChangedEvtMsg.NAME, liveMeeting.props.meetingProp.intId,
        user.intId)

      val bodyChange = UserMobileFlagChangedEvtMsgBody(user.intId, mobile)
      val eventChange = UserMobileFlagChangedEvtMsg(headerChange, bodyChange)
      val msgEventChange = BbbCommonEnvCoreMsg(envelopeChange, eventChange)
      outGW.send(msgEventChange)
    }

    for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, msg.body.userId)
    } yield {
      if (user.mobile != msg.body.mobile) {
        val userMobile = Users2x.setMobile(liveMeeting.users2x, user)
        broadcastUserMobileChanged(userMobile, msg.body.mobile)
      }
    }

  }
}