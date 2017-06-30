package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.core.running.MeetingActor

trait BreakoutApp2x extends BreakoutRoomCreatedMsgHdlr
    with BreakoutRoomEndedMsgHdlr
    with BreakoutRoomsListMsgHdlr
    with BreakoutRoomUsersUpdateMsgHdlr
    with CreateBreakoutRoomsMsgHdlr
    with EndAllBreakoutRoomsMsgHdlr
    with RequestBreakoutJoinURLMsgHdlr
    with SendBreakoutUsersUpdateMsgHdlr
    with TransferUserToMeetingRequestHdlr {

  this: MeetingActor =>

}
