package org.bigbluebutton.core.apps.mediagroups

import org.apache.pekko.actor.ActorContext
import org.apache.pekko.event.Logging

class MediaGroupHdlrs(implicit val context: ActorContext)
  extends CreateMediaGroupReqMsgHdlr
  with DestroyMediaGroupReqMsgHdlr
  with GetMediaGroupsReqMsgHdlr
  with SetUserMediaGroupStateReqMsgHdlr {

  val log = Logging(context.system, getClass)
}
