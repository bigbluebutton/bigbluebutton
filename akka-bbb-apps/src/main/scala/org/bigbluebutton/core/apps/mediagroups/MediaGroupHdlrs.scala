package org.bigbluebutton.core.apps.mediagroups

import org.apache.pekko.actor.ActorContext
import org.apache.pekko.event.Logging

class MediaGroupHdlrs(implicit val context: ActorContext)
  extends CreateMediaGroupReqMsgHdlr
  with DestroyMediaGroupReqMsgHdlr
  with GetMediaGroupsReqMsgHdlr
  with MediaGroupAddParticipantsReqMsgHdlr
  with MediaGroupRemoveParticipantsReqMsgHdlr
  with JoinMediaGroupReqMsgHdlr
  with LeaveMediaGroupReqMsgHdlr
  with MediaGroupUpdateParticipantReqMsgHdlr {

  val log = Logging(context.system, getClass)
}
