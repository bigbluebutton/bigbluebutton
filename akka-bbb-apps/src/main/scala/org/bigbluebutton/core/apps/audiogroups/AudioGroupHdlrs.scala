package org.bigbluebutton.core.apps.audiogroups

import org.apache.pekko.actor.ActorContext
import org.apache.pekko.event.Logging

class AudioGroupHdlrs(implicit val context: ActorContext)
  extends CreateAudioGroupReqMsgHdlr
  with DestroyAudioGroupReqMsgHdlr
  with GetAudioGroupsReqMsgHdlr
  with AudioGroupAddParticipantsReqMsgHdlr
  with AudioGroupRemoveParticipantsReqMsgHdlr
  with JoinAudioGroupReqMsgHdlr
  with LeaveAudioGroupReqMsgHdlr
  with AudioGroupUpdateParticipantReqMsgHdlr {

  val log = Logging(context.system, getClass)
}
