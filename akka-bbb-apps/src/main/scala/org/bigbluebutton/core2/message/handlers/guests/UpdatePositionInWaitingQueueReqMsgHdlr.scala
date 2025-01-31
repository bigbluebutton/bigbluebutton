package org.bigbluebutton.core2.message.handlers.guests

import org.bigbluebutton.common2.msgs.UpdatePositionInWaitingQueueReqMsg
import org.bigbluebutton.core.apps.RightsManagementTrait
import org.bigbluebutton.core.running.{ LiveMeeting, MeetingActor, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.MsgBuilder

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
