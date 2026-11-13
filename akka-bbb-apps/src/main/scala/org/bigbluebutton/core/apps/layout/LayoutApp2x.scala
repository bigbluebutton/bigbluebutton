package org.bigbluebutton.core.apps.layout

import org.bigbluebutton.core.models.{ Layouts, Roles, Users2x }
import org.bigbluebutton.core.running.{ LiveMeeting, MeetingActor }

trait LayoutApp2x
  extends BroadcastLayoutMsgHdlr
  with BroadcastPushLayoutMsgHdlr
  with SetScreenshareAsContentReqMsgHdlr {

  this: MeetingActor =>

  // Declared here since GetCurrentLayoutReqMsgHdlr was removed; the sibling
  // handler traits above resolve `liveMeeting` through this mixin.
  val liveMeeting: LiveMeeting
}
