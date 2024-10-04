package org.bigbluebutton.core2.message.senders

import org.bigbluebutton.core.running.OutMsgRouter

object Sender {

  def sendForceUserGraphqlReconnectionSysMsg(meetingId: String, userId: String, sessionTokens: Vector[String], reason: String, outGW: OutMsgRouter): Unit = {
    for {
      sessionToken <- sessionTokens
    } yield {
      outGW.send(
        MsgBuilder.buildForceUserGraphqlReconnectionSysMsg(meetingId, userId, sessionToken, reason)
      )
    }
  }

  def sendForceUserGraphqlDisconnectionSysMsg(meetingId: String, userId: String, sessionTokens: Vector[String], reason: String, reasonMsgId: String, outGW: OutMsgRouter): Unit = {
    for {
      sessionToken <- sessionTokens
    } yield {
      outGW.send(
        MsgBuilder.buildForceUserGraphqlDisconnectionSysMsg(meetingId, userId, sessionToken, reason, reasonMsgId)
      )
    }
  }

  def sendUserInactivityInspectMsg(meetingId: String, userId: String, responseDelay: Long, outGW: OutMsgRouter): Unit = {
    val userInactivityInspectMsg = MsgBuilder.buildUserInactivityInspectMsg(meetingId, userId, responseDelay)
    outGW.send(userInactivityInspectMsg)
  }

}
