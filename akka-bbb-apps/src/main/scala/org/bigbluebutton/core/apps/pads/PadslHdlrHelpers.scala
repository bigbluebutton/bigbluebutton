package org.bigbluebutton.core.apps.pads

import org.bigbluebutton.common2.msgs.{ BNSharedNotesCreateCmdMsg, BNSharedNotesCreateCmdMsgBody, BbbCommonEnvCoreMsg, BbbCoreEnvelope, BbbCoreHeaderWithMeetingId, PadCreateCmdMsg, PadCreateCmdMsgBody, PadCreateGroupCmdMsg, PadCreateGroupCmdMsgBody }
import org.bigbluebutton.core.running.OutMsgRouter

import java.util

object PadslHdlrHelpers {

  def broadcastPadCreateGroupCmdMsg(outGW: OutMsgRouter, meetingId: String, externalId: String, model: String): Unit = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(PadCreateGroupCmdMsg.NAME, routing)
    val header = BbbCoreHeaderWithMeetingId(PadCreateGroupCmdMsg.NAME, meetingId)
    val body = PadCreateGroupCmdMsgBody(externalId, model)
    val event = PadCreateGroupCmdMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

    outGW.send(msgEvent)
  }

  def broadcastPadCreateCmdMsg(outGW: OutMsgRouter, meetingId: String, groupId: String, name: String): Unit = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(PadCreateCmdMsg.NAME, routing)
    val header = BbbCoreHeaderWithMeetingId(PadCreateCmdMsg.NAME, meetingId)
    val body = PadCreateCmdMsgBody(groupId, name)
    val event = PadCreateCmdMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

    outGW.send(msgEvent)
  }

  def broadcastBNSharedNotesCreateCmdMsg(
      outGW:                         OutMsgRouter,
      meetingId:                     String,
      externalId:                    String,
      model:                         String,
      sharedNotesInitialContentJson: Vector[AnyRef]
  ): Unit = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(BNSharedNotesCreateCmdMsg.NAME, routing)
    val header = BbbCoreHeaderWithMeetingId(BNSharedNotesCreateCmdMsg.NAME, meetingId)
    val body = BNSharedNotesCreateCmdMsgBody(externalId, model, sharedNotesInitialContentJson)
    val event = BNSharedNotesCreateCmdMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

    outGW.send(msgEvent)
  }

}
