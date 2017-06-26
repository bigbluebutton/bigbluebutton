package org.bigbluebutton.common2.messages.breakoutrooms

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}


object CreateBreakoutRoomEvtMsg { val NAME = "CreateBreakoutRoomEvtMsg" }
case class CreateBreakoutRoomEvtMsg(header: BbbClientMsgHeader, body: CreateBreakoutRoomEvtMsgBody) extends BbbCoreMsg
case class CreateBreakoutRoomEvtMsgBody(meetingId: String, room: BreakoutRoomDetail)
case class BreakoutRoomDetail(breakoutMeetingId: String, name: String, parentId: String, sequence: Integer,
                              voiceConfId: String, durationInMinutes: Int, moderatorPassword: String, viewerPassword: String,
                              sourcePresentationId: String, sourcePresentationSlide: Int, record: Boolean)
