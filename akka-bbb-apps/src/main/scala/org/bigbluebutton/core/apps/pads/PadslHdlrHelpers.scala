package org.bigbluebutton.core.apps.pads

import org.bigbluebutton.common2.msgs.{ BNSharedNotesCreateCmdMsg, BNSharedNotesCreateCmdMsgBody, BbbCommonEnvCoreMsg, BbbCoreEnvelope, BbbCoreHeaderWithMeetingId }
import org.bigbluebutton.core.running.OutMsgRouter

object PadslHdlrHelpers {

  def broadcastBNSharedNotesCreateCmdMsg(
      outGW:                             OutMsgRouter,
      meetingId:                         String,
      externalId:                        String,
      model:                             String,
      sharedNotesInitialContentJson:     Vector[AnyRef],
      sharedNotesInitialContentMarkdown: String
  ): Unit = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(BNSharedNotesCreateCmdMsg.NAME, routing)
    val header = BbbCoreHeaderWithMeetingId(BNSharedNotesCreateCmdMsg.NAME, meetingId)
    val body = BNSharedNotesCreateCmdMsgBody(externalId, model, sharedNotesInitialContentJson, sharedNotesInitialContentMarkdown)
    val event = BNSharedNotesCreateCmdMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

    outGW.send(msgEvent)
  }

}
