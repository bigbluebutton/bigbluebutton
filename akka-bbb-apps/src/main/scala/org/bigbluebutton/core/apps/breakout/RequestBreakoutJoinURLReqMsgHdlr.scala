package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }

trait RequestBreakoutJoinURLReqMsgHdlr extends BreakoutHdlrHelpers {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleRequestBreakoutJoinURLReqMsg(msg: RequestBreakoutJoinURLReqMsg, state: MeetingState2x): MeetingState2x = {

    for {
      model <- state.breakout
      room <- model.find(msg.body.breakoutId)
    } yield {
      sendJoinURL(msg.body.userId, room.externalId, room.sequence.toString(), room.id)
    }

    state
  }
}
