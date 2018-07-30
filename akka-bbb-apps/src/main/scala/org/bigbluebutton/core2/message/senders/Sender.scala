package org.bigbluebutton.core2.message.senders

import org.bigbluebutton.core.running.OutMsgRouter

object Sender {

  def sendUserEjectedFromMeetingClientEvtMsg(meetingId: String, userId: String,
                                             ejectedBy: String, reason: String,
                                             reasonCode: String, outGW: OutMsgRouter): Unit = {
    val ejectFromMeetingClientEvent = MsgBuilder.buildUserEjectedFromMeetingEvtMsg(meetingId, userId, ejectedBy, reason, reasonCode)
    outGW.send(ejectFromMeetingClientEvent)
  }

  def sendDisconnectClientSysMsg(meetingId: String, userId: String,
                                 ejectedBy: String, reason: String, outGW: OutMsgRouter): Unit = {
    val ejectFromMeetingSystemEvent = MsgBuilder.buildDisconnectClientSysMsg(meetingId, userId, ejectedBy, reason)
    outGW.send(ejectFromMeetingSystemEvent)
  }

  def sendUserInactivityInspectMsg(meetingId: String, userId: String, responseDelay: Long, outGW: OutMsgRouter): Unit = {
    val userInactivityInspectMsg = MsgBuilder.buildUserInactivityInspectMsg(meetingId, userId, responseDelay)
    outGW.send(userInactivityInspectMsg)
  }

}
