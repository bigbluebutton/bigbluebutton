package org.bigbluebutton.core.apps.layout

import org.bigbluebutton.core.models.{ Layouts, Roles, Users2x }
import org.bigbluebutton.core.running.MeetingActor

trait LayoutApp2x
  extends BroadcastLayoutMsgHdlr
  with GetCurrentLayoutReqMsgHdlr {

  this: MeetingActor =>

  def affectedUsers(): Vector[String] = {
    if (Layouts.doesLayoutApplyToViewersOnly(liveMeeting.layouts)) {
      val users = Users2x.findAll(liveMeeting.users2x) filter { u =>
        (!u.presenter && u.role != Roles.MODERATOR_ROLE)
      }
      users.map(u => u.intId)
    } else {
      Users2x.findAll(liveMeeting.users2x).map(u => u.intId)
    }
  }
}
