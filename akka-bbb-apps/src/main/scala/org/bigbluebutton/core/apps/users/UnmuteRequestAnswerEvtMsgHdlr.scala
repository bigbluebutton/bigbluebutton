package org.bigbluebutton.core.apps.users

import org.bigbluebutton.LockSettingsUtil
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core.apps.RightsManagementTrait
// import org.bigbluebutton.core.graphql.GraphqlMiddleware

trait UnmuteRequestAnswerEvtMsgHdlr extends RightsManagementTrait {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleUnmuteRequestAnswer(msg: UnmuteRequestAnswerEvtMsg) {

    for {
      uvo <- Users2x.resetUserUnmuteRequested(liveMeeting.users2x, msg.body.userId)
    } yield {
      log.info("User answered.  meetingId=" + props.meetingProp.intId + " userId=" + uvo.intId)
    }
  }
}
