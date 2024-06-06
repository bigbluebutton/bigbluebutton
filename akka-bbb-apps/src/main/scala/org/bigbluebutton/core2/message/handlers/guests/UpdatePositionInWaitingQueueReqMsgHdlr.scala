package org.bigbluebutton.core2.message.handlers.guests

import org.bigbluebutton.common2.msgs.UpdatePositionInWaitingQueueReqMsg
import org.bigbluebutton.core.models.{ GuestsWaiting }
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.MsgBuilder
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.running.MeetingActor

trait UpdatePositionInWaitingQueueReqMsgHdlr extends RightsManagementTrait {
  this: MeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  //This class could be used for logging the information passed

  def handleUpdatePositionInWaitingQueueReqMsg(msg: UpdatePositionInWaitingQueueReqMsg): Unit = {
    val event = MsgBuilder.buildPosInWaitingQueueUpdatedRespMsg(
      liveMeeting.props.meetingProp.intId,
      msg.body.guests
    )
    outGW.send(event)
  }

}
