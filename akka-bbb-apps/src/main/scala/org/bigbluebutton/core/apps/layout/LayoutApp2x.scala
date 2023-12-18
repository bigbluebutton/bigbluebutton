package org.bigbluebutton.core.apps.layout

import org.bigbluebutton.core.models.{ Layouts, Roles, Users2x }
import org.bigbluebutton.core.running.MeetingActor

trait LayoutApp2x
  extends BroadcastLayoutMsgHdlr
  with BroadcastPushLayoutMsgHdlr
  with GetCurrentLayoutReqMsgHdlr {

  this: MeetingActor =>
}
