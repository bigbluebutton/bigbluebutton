package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.running.{ MeetingActor }

trait UnmuteRequestAnswerEvtMsgHdlr {
  this: MeetingActor =>

  def handleUnmuteRequestAnswer(msg: UnmuteRequestAnswerEvtMsg) {
    Users2x.resetUserUnmuteRequested(liveMeeting.users2x, msg.body.userId)
  }
}